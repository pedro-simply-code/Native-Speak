"use server";

import { auth } from "@/auth";
import { getServerLocale } from "@/lib/i18n/locale.server";
import { presentNotification } from "@/lib/i18n/notification-presenter";
import { requireDbAtRequest } from "@/server/db";
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/notifications/service";

export type NotificationItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export async function getNotificationFeed(): Promise<{
  unread: number;
  items: NotificationItem[];
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { unread: 0, items: [] };
  }
  await requireDbAtRequest();
  const locale = await getServerLocale();
  const userId = session.user.id;
  const [unread, rows] = await Promise.all([
    countUnreadNotifications(userId),
    listNotifications(userId, 20),
  ]);
  return {
    unread,
    items: rows.map((r) => {
      const presented = presentNotification(
        {
          kind: r.kind,
          title: r.title,
          body: r.body,
          meta: r.meta,
        },
        locale,
      );
      return {
        id: r.id,
        kind: r.kind,
        title: presented.title,
        body: presented.body,
        href: r.href,
        readAt: r.readAt,
        createdAt: r.createdAt,
      };
    }),
  };
}

export async function markNotificationReadAction(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const };
  await markNotificationRead(session.user.id, notificationId);
  return { ok: true as const };
}

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const };
  await markAllNotificationsRead(session.user.id);
  return { ok: true as const };
}
