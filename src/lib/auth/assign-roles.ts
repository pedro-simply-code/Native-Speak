import { eq } from "drizzle-orm";
import type { AppRole } from "@/lib/auth/roles";
import { getDb } from "@/server/db";
import { userRoles, users } from "@/server/db/schema";

/**
 * Ensures OAuth / legacy sign-ups get role `family` when they have no roles yet.
 * Staff roles (admin, manager, teacher) come only from invites or admin actions.
 */
export async function ensureDefaultRolesForUser(userId: string): Promise<void> {
  const db = getDb();

  const [dbUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!dbUser) return;

  const existing = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, userId))
    .limit(1);

  if (existing.length > 0) return;

  await db
    .insert(userRoles)
    .values({ userId, role: "family" satisfies AppRole })
    .onConflictDoNothing({
      target: [userRoles.userId, userRoles.role],
    });
}
