"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import type { AppRole } from "@/lib/auth/roles";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { hasPermission } from "@/lib/auth/permissions";
import { applyTeacherProfileFromInvite } from "@/lib/auth/staff-invite";
import { requireDbAtRequest } from "@/server/db";
import { auditLogs, userRoles, users } from "@/server/db/schema";
import {
  getAdminUserById,
  listAllAdminUsers,
  searchAdminUsers,
  type AdminUserRoleView,
} from "@/server/queries/admin-users";
import { countUsersWithRole } from "@/server/queries/dashboard";

const roleSchema = z.enum(["admin", "manager", "teacher", "family"]);

async function requireUserManage() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Sign in required." };
  }
  const roles = (session.user.roles ?? []) as AppRole[];
  if (!roles.includes("admin") || !hasPermission(roles, "users.manage")) {
    return { ok: false as const, error: "Admin access required." };
  }
  return { ok: true as const, session };
}

export async function searchUsersForRoleAdmin(
  query: string,
): Promise<
  { ok: true; users: AdminUserRoleView[] } | { ok: false; error: string }
> {
  const gate = await requireUserManage();
  if (!gate.ok) return gate;
  try {
    const term = query.trim();
    const users =
      term.length >= 2
        ? await searchAdminUsers(term)
        : await listAllAdminUsers();
    return { ok: true, users };
  } catch {
    return { ok: false, error: "Could not load users." };
  }
}

const targetSchema = z.object({
  userId: z.string().uuid(),
  role: roleSchema,
});

export async function grantUserRoleAdmin(input: {
  userId: string;
  role: AppRole;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireUserManage();
  if (!gate.ok) return gate;

  const parsed = targetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }
  const { userId, role } = parsed.data;

  const db = await requireDbAtRequest();
  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) {
    return { ok: false, error: "User not found." };
  }

  await db
    .insert(userRoles)
    .values({
      userId,
      role,
      assignedBy: gate.session.user.id,
    })
    .onConflictDoNothing({
      target: [userRoles.userId, userRoles.role],
    });

  if (role === "teacher") {
    await applyTeacherProfileFromInvite(userId, {
      bio: "",
      timezone: "America/Chicago",
      staffStatus: "invited",
    });
  }

  await db.insert(auditLogs).values({
    actorUserId: gate.session.user.id,
    action: "user.role.granted",
    target: user.email,
    meta: { userId, role, label: ROLE_LABELS[role] },
  });

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/managers");
  revalidatePath("/dashboard/teachers");
  revalidatePath("/dashboard/admin/families");

  return { ok: true };
}

export async function revokeUserRoleAdmin(input: {
  userId: string;
  role: AppRole;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await requireUserManage();
  if (!gate.ok) return gate;

  const parsed = targetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }
  const { userId, role } = parsed.data;

  if (role === "admin" && userId === gate.session.user.id) {
    return { ok: false, error: "You cannot remove your own admin role." };
  }

  if (role === "admin") {
    const adminCount = await countUsersWithRole("admin");
    const db = await requireDbAtRequest();
    const [stillAdmin] = await db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, "admin")))
      .limit(1);
    if (stillAdmin && adminCount <= 1) {
      return { ok: false, error: "Cannot remove the last admin account." };
    }
  }

  const db = await requireDbAtRequest();
  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) {
    return { ok: false, error: "User not found." };
  }

  await db
    .delete(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));

  const remaining = await db
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));

  if (remaining.length === 0) {
    await db
      .insert(userRoles)
      .values({
        userId,
        role: "family",
        assignedBy: gate.session.user.id,
      })
      .onConflictDoNothing({
        target: [userRoles.userId, userRoles.role],
      });
  }

  await db.insert(auditLogs).values({
    actorUserId: gate.session.user.id,
    action: "user.role.revoked",
    target: user.email,
    meta: { userId, role, label: ROLE_LABELS[role] },
  });

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/managers");
  revalidatePath("/dashboard/teachers");
  revalidatePath("/dashboard/admin/families");

  return { ok: true };
}

export async function refreshAdminUser(
  userId: string,
): Promise<
  { ok: true; user: AdminUserRoleView } | { ok: false; error: string }
> {
  const gate = await requireUserManage();
  if (!gate.ok) return gate;
  const user = await getAdminUserById(userId);
  if (!user) return { ok: false, error: "User not found." };
  return { ok: true, user };
}
