import { createHash, randomInt } from "node:crypto";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { hashOpaqueToken } from "@/lib/security/crypto";
import { requireDb } from "@/server/db";
import { authOtpChallenges } from "@/server/db/schema";

export type OtpPurpose = "login_2fa" | "email_login" | "totp_setup";

const OTP_TTL_MS: Record<OtpPurpose, number> = {
  login_2fa: 10 * 60 * 1000,
  email_login: 10 * 60 * 1000,
  totp_setup: 15 * 60 * 1000,
};

function hashOtpCode(code: string) {
  return createHash("sha256").update(`ns-otp:${code}`).digest("hex");
}

export function generateOtpCode() {
  return String(randomInt(100_000, 1_000_000));
}

export async function createOtpChallenge(opts: {
  email: string;
  userId?: string;
  purpose: OtpPurpose;
  code?: string;
}) {
  const code = opts.code ?? generateOtpCode();
  const db = requireDb();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS[opts.purpose]);

  const [row] = await db
    .insert(authOtpChallenges)
    .values({
      email: opts.email.toLowerCase(),
      userId: opts.userId,
      purpose: opts.purpose,
      codeHash: hashOtpCode(code),
      expiresAt,
    })
    .returning({ id: authOtpChallenges.id });

  return { challengeId: row?.id ?? "", code, expiresAt };
}

export async function verifyOtpChallenge(
  challengeId: string,
  code: string,
  purpose: OtpPurpose,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const db = requireDb();
  const now = new Date();

  const [row] = await db
    .select()
    .from(authOtpChallenges)
    .where(
      and(
        eq(authOtpChallenges.id, challengeId),
        eq(authOtpChallenges.purpose, purpose),
        gt(authOtpChallenges.expiresAt, now),
        isNull(authOtpChallenges.consumedAt),
      ),
    )
    .limit(1);

  if (!row) {
    return { ok: false, reason: "Code expired or invalid." };
  }

  if (row.attempts >= row.maxAttempts) {
    return { ok: false, reason: "Too many attempts. Request a new code." };
  }

  const matches = hashOtpCode(code) === row.codeHash;

  await db
    .update(authOtpChallenges)
    .set({ attempts: row.attempts + 1 })
    .where(eq(authOtpChallenges.id, row.id));

  if (!matches) {
    return { ok: false, reason: "Incorrect code." };
  }

  await db
    .update(authOtpChallenges)
    .set({ consumedAt: now })
    .where(eq(authOtpChallenges.id, row.id));

  return { ok: true };
}

/** One-shot code via email without pre-created challenge row (passwordless login). */
export async function verifyEmailLoginCode(
  email: string,
  code: string,
): Promise<boolean> {
  const db = requireDb();
  const now = new Date();
  const [row] = await db
    .select()
    .from(authOtpChallenges)
    .where(
      and(
        eq(authOtpChallenges.email, email.toLowerCase()),
        eq(authOtpChallenges.purpose, "email_login"),
        gt(authOtpChallenges.expiresAt, now),
        isNull(authOtpChallenges.consumedAt),
      ),
    )
    .orderBy(desc(authOtpChallenges.createdAt))
    .limit(1);

  if (!row || row.attempts >= row.maxAttempts) return false;
  const matches = hashOtpCode(code) === row.codeHash;

  await db
    .update(authOtpChallenges)
    .set({ attempts: row.attempts + 1 })
    .where(eq(authOtpChallenges.id, row.id));

  if (!matches) return false;

  await db
    .update(authOtpChallenges)
    .set({ consumedAt: now })
    .where(eq(authOtpChallenges.id, row.id));

  return true;
}

export { hashOpaqueToken };
