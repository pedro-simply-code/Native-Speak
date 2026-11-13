import { count, desc, eq, inArray } from "drizzle-orm";
import type { AppRole } from "@/lib/auth/roles";
import { requireDbAtRequest } from "@/server/db";
import {
  invitations,
  payments,
  teacherApplications,
  userRoles,
  users,
} from "@/server/db/schema";

export async function countUsersWithRole(role: AppRole): Promise<number> {
  const db = await requireDbAtRequest();
  const [row] = await db
    .select({ value: count() })
    .from(userRoles)
    .where(eq(userRoles.role, role));
  return Number(row?.value ?? 0);
}

export async function countPendingInvites(): Promise<number> {
  const db = await requireDbAtRequest();
  const [row] = await db
    .select({ value: count() })
    .from(invitations)
    .where(eq(invitations.status, "pending"));
  return Number(row?.value ?? 0);
}

export async function getAdminOverviewStats() {
  const [managers, teachers, families, openInvites] = await Promise.all([
    countUsersWithRole("manager"),
    countUsersWithRole("teacher"),
    countUsersWithRole("family"),
    countPendingInvites(),
  ]);
  return { managers, teachers, families, openInvites };
}

export async function listUsersByRole(role: AppRole) {
  const db = await requireDbAtRequest();
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .where(eq(userRoles.role, role))
    .orderBy(desc(users.createdAt));
}

export async function countTeacherApplicationsPending(): Promise<number> {
  const db = await requireDbAtRequest();
  const [row] = await db
    .select({ value: count() })
    .from(teacherApplications)
    .where(
      inArray(teacherApplications.status, ["submitted", "under_review"]),
    );
  return Number(row?.value ?? 0);
}

export async function listPaymentsForUser(userId: string, limit = 20) {
  const db = await requireDbAtRequest();
  return db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}

export async function listAllPayments(limit = 50) {
  const db = await requireDbAtRequest();
  return db
    .select({
      id: payments.id,
      amountCents: payments.amountCents,
      currency: payments.currency,
      status: payments.status,
      provider: payments.provider,
      createdAt: payments.createdAt,
      userEmail: users.email,
      metadata: payments.metadata,
    })
    .from(payments)
    .innerJoin(users, eq(users.id, payments.userId))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}
