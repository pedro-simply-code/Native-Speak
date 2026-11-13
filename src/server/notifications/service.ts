import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import type { AppRole } from "@/lib/auth/roles";
import type { NotificationPayload } from "@/lib/notifications/catalog";
import { requireDb } from "@/server/db";
import { notifications, userRoles } from "@/server/db/schema";

export async function notifyUser(
  userId: string,
  payload: NotificationPayload,
) {
  const db = requireDb();
  await db.insert(notifications).values({
    userId,
    kind: payload.kind,
    title: payload.title,
    body: payload.body,
    href: payload.href,
    meta: payload.meta ?? {},
  });
}

export async function notifyUsers(
  userIds: string[],
  payload: NotificationPayload,
  { exceptUserId }: { exceptUserId?: string } = {},
) {
  const unique = [...new Set(userIds)].filter(
    (id) => id && id !== exceptUserId,
  );
  if (unique.length === 0) return;

  const db = requireDb();
  await db.insert(notifications).values(
    unique.map((userId) => ({
      userId,
      kind: payload.kind,
      title: payload.title,
      body: payload.body,
      href: payload.href,
      meta: payload.meta ?? {},
    })),
  );
}

export async function notifyRoles(
  roles: AppRole[],
  payload: NotificationPayload,
  options: { exceptUserId?: string } = {},
) {
  if (roles.length === 0) return;
  const db = requireDb();
  const rows = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(inArray(userRoles.role, roles));
  await notifyUsers(
    rows.map((r) => r.userId),
    payload,
    options,
  );
}

export async function countUnreadNotifications(userId: string) {
  const db = requireDb();
  const [row] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return Number(row?.value ?? 0);
}

export async function listNotifications(userId: string, limit = 25) {
  const db = requireDb();
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
) {
  const db = requireDb();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    );
}

export async function markAllNotificationsRead(userId: string) {
  const db = requireDb();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(notifications.userId, userId), isNull(notifications.readAt)),
    );
}
