import type { notifications } from "@/server/db/schema";

export type NotificationKind =
  (typeof notifications.$inferInsert)["kind"];

export type NotificationPayload = {
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string;
  meta?: Record<string, unknown>;
};

/**
 * Recommended in-app alerts for Native Speak (roadmap in comments).
 *
 * Implemented now:
 * - Family self-registration → admin + manager
 * - Staff invite accepted (manager/teacher) → inviter + admin
 * - Teacher application + documents → admin + manager
 * - Class booked → assigned teacher (+ family confirmation copy optional)
 * - Payment succeeded → admin
 *
 * Add later:
 * - manager.access_requested (public form → admin approves invite)
 * - appointment.reminder_24h / appointment.cancelled
 * - invite.expiring_soon
 * - teacher.availability_gap (ops)
 * - family.verification_pending (admin)
 * - payment.failed (family + admin)
 */
export const NOTIFICATION_ROUTES: Partial<Record<NotificationKind, string>> = {
  "account.family_registered": "/dashboard/admin/families",
  "account.staff_joined": "/dashboard/admin/managers",
  "invite.accepted": "/dashboard/admin/invitations",
  "teacher.application_submitted": "/dashboard/manager/applications",
  "appointment.booked": "/dashboard/teacher/appointments",
  "appointment.cancelled": "/dashboard/family/classes",
  "appointment.reschedule_requested": "/dashboard/manager/schedule-requests",
  "appointment.change_reviewed": "/dashboard/family/classes",
  "payment.received": "/dashboard/billing",
};
