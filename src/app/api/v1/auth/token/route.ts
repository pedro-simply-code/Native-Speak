import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/env.js";
import { issueApi2faChallenge } from "@/lib/security/api-2fa-challenge";
import { issueApiTokensForUser } from "@/lib/security/api-tokens";
import { recordSecurityAudit } from "@/lib/security/audit";
import { verifyPasswordForUser } from "@/lib/security/credentials";
import { createOtpChallenge } from "@/lib/security/otp";
import { sendEmail } from "@/lib/email/send";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  if (!env.JWT_ACCESS_SECRET || !env.JWT_REFRESH_SECRET) {
    return NextResponse.json({ error: "JWT not configured" }, { status: 503 });
  }

  const ip = await getClientIp();
  const limit = await enforceRateLimit(ip, {
    bucket: "api-token",
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
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const emailLimit = await enforceRateLimit(email, {
    bucket: "api-token-email",
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!emailLimit.allowed) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }

  const result = await verifyPasswordForUser(email, parsed.data.password);
  if (!result.ok) {
    await recordSecurityAudit("auth.api_token_failed", {
      target: email,
      meta: { reason: result.reason },
      ip,
    });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const user = result.user;

  if (user.twoFactorEnabled && user.twoFactorMethod) {
    const twoFactorToken = await issueApi2faChallenge(user.id);

    if (user.twoFactorMethod === "email") {
      const { code } = await createOtpChallenge({
        email,
        userId: user.id,
        purpose: "login_2fa",
      });
      await sendEmail({
        to: email,
        subject: "Your Native Speak API sign-in code",
        text: `Your API sign-in code is ${code}. It expires in 10 minutes.`,
      });
    }

    return NextResponse.json({
      twoFactorRequired: true,
      twoFactorToken,
      method: user.twoFactorMethod,
      message:
        user.twoFactorMethod === "email"
          ? "A verification code was sent to your email."
          : "Enter the code from your authenticator app.",
    });
  }

  const tokens = await issueApiTokensForUser(user.id, ip);
  if (!tokens) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await recordSecurityAudit("auth.api_token_issued", {
    actorUserId: user.id,
    ip,
  });

  return NextResponse.json(tokens);
}
