"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { recordSecurityAudit } from "@/lib/security/audit";
import { verifyPasswordForUser } from "@/lib/security/credentials";
import { createLoginProof } from "@/lib/security/login-proof";
import { createOtpChallenge, verifyOtpChallenge } from "@/lib/security/otp";
import { openTotpSecret, verifyTotpCode } from "@/lib/security/totp";
import {
  clearRateWindow,
  enforceRateLimit,
  getClientIp,
} from "@/lib/security/rate-limit";
import { verifyEmailLoginCode } from "@/lib/security/otp";
import { sendEmail } from "@/lib/email/send";
import { env } from "@/env.js";
import { requireDb } from "@/server/db";
import { users } from "@/server/db/schema";

const emailSchema = z.string().email();

export type LoginFlowState =
  | { ok: false; error: string }
  | { ok: true; step: "session"; loginProof: string; email: string }
  | { ok: true; step: "2fa"; challengeId: string; method: "email" | "totp"; email: string };

export async function startPasswordLogin(input: {
  email: string;
  password: string;
}): Promise<LoginFlowState> {
  const ip = await getClientIp();
  const emailLimit = await enforceRateLimit(input.email.toLowerCase(), {
    bucket: "auth-login-email",
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  const ipLimit = await enforceRateLimit(ip, {
    bucket: "auth-login-ip",
    limit: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (!emailLimit.allowed || !ipLimit.allowed) {
    return { ok: false, error: "Too many attempts. Try again later." };
  }

  const parsed = z
    .object({
      email: emailSchema,
      password: z.string().min(8).max(128),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid email or password." };
  }

  const result = await verifyPasswordForUser(
    parsed.data.email,
    parsed.data.password,
  );

  if (!result.ok) {
    await recordSecurityAudit("auth.login_failed", {
      target: parsed.data.email.toLowerCase(),
      meta: { reason: result.reason },
      ip,
    });
    if (result.reason === "locked") {
      const min = Math.ceil((result.lockMs ?? 0) / 60_000);
      return {
        ok: false,
        error: `Account temporarily locked. Try again in about ${min} minute(s).`,
      };
    }
    if (result.reason === "unverified") {
      return {
        ok: false,
        error: "Verify your email before signing in.",
      };
    }
    if (result.reason === "no_password") {
      return {
        ok: false,
        error: "Use Google or email code to sign in.",
      };
    }
    if (result.reason === "not_found" && env.NODE_ENV === "development") {
      return {
        ok: false,
        error: "No account exists for this email. Create one at /register first.",
      };
    }
    return { ok: false, error: "Invalid email or password." };
  }

  const user = result.user;
  const email = user.email.toLowerCase();

  if (user.twoFactorEnabled && user.twoFactorMethod) {
    if (user.twoFactorMethod === "email") {
      const { challengeId, code } = await createOtpChallenge({
        email,
        userId: user.id,
        purpose: "login_2fa",
      });
      await sendEmail({
        to: email,
        subject: "Your Native Speak sign-in code",
        text: `Your sign-in code is ${code}. It expires in 10 minutes.\n\nIf you didn't try to sign in, change your password.`,
      });
      return {
        ok: true,
        step: "2fa",
        challengeId,
        method: "email",
        email,
      };
    }
    return {
      ok: true,
      step: "2fa",
      challengeId: user.id,
      method: "totp",
      email,
    };
  }

  const loginProof = await createLoginProof(user.id);
  await recordSecurityAudit("auth.login_password_ok", {
    actorUserId: user.id,
    target: email,
    ip,
  });
  await clearRateWindow("auth-login-email", email);
  return { ok: true, step: "session", loginProof, email };
}

export async function completeTwoFactorLogin(input: {
  challengeId: string;
  method: "email" | "totp";
  code: string;
  email: string;
}): Promise<LoginFlowState> {
  const ip = await getClientIp();
  const limit = await enforceRateLimit(`${input.email}:${ip}`, {
    bucket: "auth-2fa",
    limit: 12,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.allowed) {
    return { ok: false, error: "Too many attempts. Try again later." };
  }

  const email = input.email.toLowerCase();
  const db = requireDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user?.twoFactorEnabled) {
    return { ok: false, error: "Two-factor authentication is not enabled." };
  }

  let verified = false;

  if (input.method === "email") {
    const check = await verifyOtpChallenge(
      input.challengeId,
      input.code,
      "login_2fa",
    );
    if (!check.ok) {
      return { ok: false, error: check.reason };
    }
    verified = true;
  } else {
    const secret = openTotpSecret(user.totpSecretEnc);
    if (!secret) {
      return { ok: false, error: "Authenticator not configured." };
    }
    verified = verifyTotpCode(secret, input.code.replace(/\s/g, ""));
    if (!verified) {
      await recordSecurityAudit("auth.2fa_failed", {
        actorUserId: user.id,
        ip,
      });
      return { ok: false, error: "Invalid authenticator code." };
    }
  }

  const loginProof = await createLoginProof(user.id);
  await recordSecurityAudit("auth.2fa_ok", { actorUserId: user.id, ip });
  return { ok: true, step: "session", loginProof, email };
}

export async function requestEmailLoginCode(email: string) {
  const ip = await getClientIp();
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { ok: false as const, error: "Enter a valid email." };
  }

  const normalized = parsed.data.toLowerCase();
  const limit = await enforceRateLimit(`${normalized}:${ip}`, {
    bucket: "auth-email-code",
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return { ok: false as const, error: "Too many codes sent. Try later." };
  }

  const db = requireDb();
  const [user] = await db
    .select({
      id: users.id,
      status: users.status,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  if (!user) {
    return {
      ok: true as const,
      message:
        "If an account exists, we sent a sign-in code to that email.",
    };
  }

  if (user.status === "suspended") {
    return { ok: false as const, error: "Account is not active." };
  }

  const { code } = await createOtpChallenge({
    email: normalized,
    userId: user.id,
    purpose: "email_login",
  });

  await sendEmail({
    to: normalized,
    subject: "Your Native Speak sign-in code",
    text: `Your one-time sign-in code is ${code}. It expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
  });

  await recordSecurityAudit("auth.email_code_sent", {
    actorUserId: user.id,
    target: normalized,
    ip,
  });

  return {
    ok: true as const,
    message:
      "If an account exists, we sent a sign-in code to that email.",
  };
}

export async function startEmailCodeLogin(input: {
  email: string;
  code: string;
}): Promise<LoginFlowState> {
  const ip = await getClientIp();
  const parsed = z
    .object({
      email: emailSchema,
      code: z.string().min(4).max(12),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid code." };
  }

  const email = parsed.data.email.toLowerCase();
  const limit = await enforceRateLimit(`${email}:${ip}`, {
    bucket: "auth-email-code-verify",
    limit: 15,
    windowMs: 15 * 60 * 1000,
  });
  if (!limit.allowed) {
    return { ok: false, error: "Too many attempts. Try again later." };
  }

  const db = requireDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return { ok: false, error: "Invalid code." };
  }

  const valid = await verifyEmailLoginCode(email, parsed.data.code.trim());
  if (!valid) {
    await recordSecurityAudit("auth.email_code_failed", {
      actorUserId: user.id,
      ip,
    });
    return { ok: false, error: "Invalid or expired code." };
  }

  if (user.twoFactorEnabled && user.twoFactorMethod) {
    if (user.twoFactorMethod === "email") {
      const { challengeId, code } = await createOtpChallenge({
        email,
        userId: user.id,
        purpose: "login_2fa",
      });
      await sendEmail({
        to: email,
        subject: "Your Native Speak sign-in code",
        text: `Your sign-in code is ${code}. It expires in 10 minutes.`,
      });
      return {
        ok: true,
        step: "2fa",
        challengeId,
        method: "email",
        email,
      };
    }
    return {
      ok: true,
      step: "2fa",
      challengeId: user.id,
      method: "totp",
      email,
    };
  }

  await db
    .update(users)
    .set({
      emailVerified: user.emailVerified ?? new Date(),
      status: user.status === "pending_verification" ? "active" : user.status,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  const loginProof = await createLoginProof(user.id);
  await recordSecurityAudit("auth.email_code_ok", {
    actorUserId: user.id,
    ip,
  });
  return { ok: true, step: "session", loginProof, email };
}
