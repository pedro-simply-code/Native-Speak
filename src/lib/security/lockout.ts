import { eq } from "drizzle-orm";
import { requireDb } from "@/server/db";
import { users } from "@/server/db/schema";

export const LOCKOUT_MAX_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export function isAccountLocked(lockedUntil: Date | null | undefined) {
  if (!lockedUntil) return false;
  return lockedUntil.getTime() > Date.now();
}

export async function recordFailedLogin(userId: string) {
  const db = requireDb();
  const [row] = await db
    .select({
      attempts: users.failedLoginAttempts,
      lockedUntil: users.lockedUntil,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return;

  const nextAttempts = row.attempts + 1;
  const lockedUntil =
    nextAttempts >= LOCKOUT_MAX_ATTEMPTS
      ? new Date(Date.now() + LOCKOUT_DURATION_MS)
      : row.lockedUntil;

  await db
    .update(users)
    .set({
      failedLoginAttempts: nextAttempts,
      lockedUntil: lockedUntil ?? row.lockedUntil,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function clearLoginLockout(userId: string) {
  const db = requireDb();
  await db
    .update(users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

/** Returns remaining lock ms when locked. */
export async function getLockoutRemainingMs(
  userId: string,
): Promise<number | null> {
  const db = requireDb();
  const [row] = await db
    .select({ lockedUntil: users.lockedUntil })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row?.lockedUntil || !isAccountLocked(row.lockedUntil)) return null;
  return row.lockedUntil.getTime() - Date.now();
}
