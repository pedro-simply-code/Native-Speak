import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/env.js";
import { pickPrimaryRole } from "@/lib/auth/roles";
import { recordSecurityAudit } from "@/lib/security/audit";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { requireDb } from "@/server/db";
import { apiRefreshTokens, userRoles, users } from "@/server/db/schema";

const bodySchema = z.object({
  refreshToken: z.string().min(32).max(256),
});

export async function POST(req: Request) {
  if (!env.JWT_ACCESS_SECRET) {
    return NextResponse.json({ error: "JWT not configured" }, { status: 503 });
  }

  const ip = await getClientIp();
  const limit = await enforceRateLimit(ip, {
    bucket: "api-refresh",
    limit: 60,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const tokenHash = createHash("sha256")
    .update(parsed.data.refreshToken)
    .digest("hex");
  const db = requireDb();
  const now = new Date();

  const [stored] = await db
    .select()
    .from(apiRefreshTokens)
    .where(
      and(
        eq(apiRefreshTokens.tokenHash, tokenHash),
        gt(apiRefreshTokens.expiresAt, now),
        isNull(apiRefreshTokens.revokedAt),
      ),
    )
    .limit(1);

  if (!stored) {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  await db
    .update(apiRefreshTokens)
    .set({ revokedAt: now })
    .where(eq(apiRefreshTokens.id, stored.id));

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, stored.userId))
    .limit(1);
  if (!user || user.status === "suspended") {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const roles = (
    await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id))
  ).map((r) => r.role);

  const access = await new SignJWT({
    sub: user.id,
    email: user.email,
    roles,
    primaryRole: pickPrimaryRole(roles),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(new TextEncoder().encode(env.JWT_ACCESS_SECRET));

  const refreshRaw = randomBytes(48).toString("hex");
  const refreshHash = createHash("sha256").update(refreshRaw).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  await db.insert(apiRefreshTokens).values({
    userId: user.id,
    tokenHash: refreshHash,
    expiresAt,
  });

  await recordSecurityAudit("auth.api_token_refreshed", {
    actorUserId: user.id,
    ip,
  });

  return NextResponse.json({
    accessToken: access,
    refreshToken: refreshRaw,
    tokenType: "Bearer",
    expiresIn: 900,
  });
}
