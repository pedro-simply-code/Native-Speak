"use server";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/email/send";
import { recordSecurityAudit } from "@/lib/security/audit";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { requireDb } from "@/server/db";
import { users, verificationTokens } from "@/server/db/schema";

export async function resendVerificationEmail(email: string) {
  const ip = await getClientIp();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { ok: false as const, error: "Enter a valid email." };
  }

  const normalized = parsed.data.toLowerCase();
  const limit = await enforceRateLimit(`${normalized}:${ip}`, {
    bucket: "auth-resend-verify",
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return {
      ok: false as const,
      error: "Too many requests. Try again in about an hour.",
    };
  }

  const db = requireDb();
  const [user] = await db
    .select({
      id: users.id,
      emailVerified: users.emailVerified,
      status: users.status,
    })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  if (!user) {
    return {
      ok: true as const,
      message:
        "If an account exists and needs verification, we sent a new link.",
    };
  }

  if (user.emailVerified || user.status === "active") {
    return {
      ok: true as const,
      message: "If an account exists and needs verification, we sent a new link.",
    };
  }

  const token = nanoid(48);
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, normalized));

  await db.insert(verificationTokens).values({
    identifier: normalized,
    token,
    expires,
  });

  const mail = await sendVerificationEmail(normalized, token);

  await recordSecurityAudit("auth.verification_resent", {
    actorUserId: user.id,
    target: normalized,
    ip,
  });

  return {
    ok: true as const,
    message: mail.sent
      ? "We sent a new verification link to your email."
      : "Email is not configured — check the server console for the verification link.",
  };
}
