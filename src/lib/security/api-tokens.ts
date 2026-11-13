import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { env } from "@/env.js";
import { pickPrimaryRole } from "@/lib/auth/roles";
import { registerApiSession } from "@/lib/security/sessions";
import { requireDb } from "@/server/db";
import { apiRefreshTokens, userRoles, users } from "@/server/db/schema";

export async function issueApiTokensForUser(
  userId: string,
  ip: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  sessionId: string;
} | null> {
  if (!env.JWT_ACCESS_SECRET) return null;

  const db = requireDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user.status === "suspended") return null;

  const roles = (
    await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id))
  ).map((r) => r.role);

  const session = await registerApiSession(user.id, ip);

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

  return {
    accessToken: access,
    refreshToken: refreshRaw,
    tokenType: "Bearer",
    expiresIn: 900,
    sessionId: session.sessionId,
  };
}
