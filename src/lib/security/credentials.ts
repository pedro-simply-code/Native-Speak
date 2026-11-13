import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import {
  clearLoginLockout,
  getLockoutRemainingMs,
  isAccountLocked,
  recordFailedLogin,
} from "@/lib/security/lockout";

export type AuthUserRow = typeof users.$inferSelect;

export async function findUserByEmail(email: string) {
  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return user ?? null;
}

export type PasswordCheckResult =
  | { ok: false; reason: "not_found" | "no_password" | "invalid" | "suspended" | "unverified" | "locked"; lockMs?: number }
  | { ok: true; user: AuthUserRow };

export async function verifyPasswordForUser(
  email: string,
  password: string,
): Promise<PasswordCheckResult> {
  const user = await findUserByEmail(email);
  if (!user) {
    return { ok: false, reason: "not_found" };
  }

  if (isAccountLocked(user.lockedUntil)) {
    const lockMs = await getLockoutRemainingMs(user.id);
    return { ok: false, reason: "locked", lockMs: lockMs ?? undefined };
  }

  if (!user.passwordHash) {
    return { ok: false, reason: "no_password" };
  }

  if (user.status === "suspended") {
    return { ok: false, reason: "suspended" };
  }

  if (user.status === "pending_verification" && !user.emailVerified) {
    return { ok: false, reason: "unverified" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    await recordFailedLogin(user.id);
    return { ok: false, reason: "invalid" };
  }

  await clearLoginLockout(user.id);
  return { ok: true, user };
}

export function userToSessionShape(user: AuthUserRow) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}
