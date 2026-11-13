import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/env.js";
import { verifyApi2faChallenge } from "@/lib/security/api-2fa-challenge";
import { issueApiTokensForUser } from "@/lib/security/api-tokens";
import { recordSecurityAudit } from "@/lib/security/audit";
import { verifyOtpChallenge } from "@/lib/security/otp";
import { openTotpSecret, verifyTotpCode } from "@/lib/security/totp";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { requireDb } from "@/server/db";
import { authOtpChallenges, users } from "@/server/db/schema";

const bodySchema = z.object({
  twoFactorToken: z.string().min(10),
  code: z.string().min(4).max(12),
});

export async function POST(req: Request) {
  if (!env.JWT_ACCESS_SECRET) {
    return NextResponse.json({ error: "JWT not configured" }, { status: 503 });
  }

  const ip = await getClientIp();
  const limit = await enforceRateLimit(ip, {
    bucket: "api-2fa",
    limit: 20,
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
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const userId = await verifyApi2faChallenge(parsed.data.twoFactorToken);
  if (!userId) {
    return NextResponse.json({ error: "Challenge expired" }, { status: 401 });
  }

  const db = requireDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.twoFactorEnabled || !user.twoFactorMethod) {
    return NextResponse.json({ error: "2FA not enabled" }, { status: 400 });
  }

  const code = parsed.data.code.replace(/\s/g, "");

  if (user.twoFactorMethod === "email") {
    const now = new Date();
    const [challenge] = await db
      .select()
      .from(authOtpChallenges)
      .where(
        and(
          eq(authOtpChallenges.userId, userId),
          eq(authOtpChallenges.purpose, "login_2fa"),
          gt(authOtpChallenges.expiresAt, now),
          isNull(authOtpChallenges.consumedAt),
        ),
      )
      .orderBy(desc(authOtpChallenges.createdAt))
      .limit(1);

    if (!challenge) {
      return NextResponse.json({ error: "No active email code" }, { status: 401 });
    }

    const verified = await verifyOtpChallenge(challenge.id, code, "login_2fa");
    if (!verified.ok) {
      return NextResponse.json({ error: verified.reason }, { status: 401 });
    }
  } else {
    const secret = openTotpSecret(user.totpSecretEnc);
    const valid = secret ? verifyTotpCode(secret, code) : false;
    if (!valid) {
      await recordSecurityAudit("auth.api_2fa_failed", { actorUserId: userId, ip });
      return NextResponse.json({ error: "Invalid authenticator code" }, { status: 401 });
    }
  }

  const tokens = await issueApiTokensForUser(userId, ip);
  if (!tokens) {
    return NextResponse.json({ error: "Could not issue tokens" }, { status: 500 });
  }

  await recordSecurityAudit("auth.api_token_issued", {
    actorUserId: userId,
    meta: { via: "2fa" },
    ip,
  });

  return NextResponse.json(tokens);
}
