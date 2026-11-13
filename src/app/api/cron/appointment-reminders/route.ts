import { and, eq, isNull, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/server/db";
import {
  appointmentReminders,
  classAppointments,
} from "@/server/db/schema";
import { notifyUser } from "@/server/notifications/service";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = requireDb();
  const now = new Date();

  const due = await db
    .select({
      reminderId: appointmentReminders.id,
      kind: appointmentReminders.kind,
      appointmentId: appointmentReminders.appointmentId,
      startsAt: classAppointments.startsAt,
      familyUserId: classAppointments.familyUserId,
      teacherUserId: classAppointments.teacherUserId,
    })
    .from(appointmentReminders)
    .innerJoin(
      classAppointments,
      eq(classAppointments.id, appointmentReminders.appointmentId),
    )
    .where(
      and(
        isNull(appointmentReminders.sentAt),
        lte(appointmentReminders.scheduledFor, now),
        eq(classAppointments.status, "scheduled"),
      ),
    )
    .limit(50);

  let sent = 0;
  for (const row of due) {
    const label =
      row.kind === "reminder_24h" ? "24 hours" : "1 hour";
    const body = `Reminder: class starts in ${label} (${row.startsAt.toLocaleString()}).`;

    await Promise.all([
      notifyUser(row.familyUserId, {
        kind: "appointment.booked",
        title: "Class reminder",
        body,
        href: "/dashboard/family/classes",
        meta: { appointmentId: row.appointmentId, kind: row.kind },
      }),
      notifyUser(row.teacherUserId, {
        kind: "appointment.booked",
        title: "Class reminder",
        body,
        href: "/dashboard/teacher/appointments",
        meta: { appointmentId: row.appointmentId, kind: row.kind },
      }),
    ]);

    await db
      .update(appointmentReminders)
      .set({ sentAt: now })
      .where(eq(appointmentReminders.id, row.reminderId));
    sent += 1;
  }

  return NextResponse.json({ ok: true, processed: sent });
}
