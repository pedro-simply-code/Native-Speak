import { and, eq, inArray, lt, gt } from "drizzle-orm";
import { requireDb } from "@/server/db";
import {
  classAppointments,
  teacherCalendarBlocks,
} from "@/server/db/schema";

export async function assertTeacherSlotAvailable(
  teacherUserId: string,
  startsAt: Date,
  endsAt: Date,
  excludeAppointmentId?: string,
) {
  const db = requireDb();

  const activeStatuses = ["scheduled"] as const;

  const rows = await db
    .select({
      id: classAppointments.id,
      startsAt: classAppointments.startsAt,
      endsAt: classAppointments.endsAt,
    })
    .from(classAppointments)
    .where(
      and(
        eq(classAppointments.teacherUserId, teacherUserId),
        inArray(classAppointments.status, [...activeStatuses]),
      ),
    );

  for (const row of rows) {
    if (excludeAppointmentId && row.id === excludeAppointmentId) continue;
    const overlap =
      startsAt < row.endsAt && endsAt > row.startsAt;
    if (overlap) {
      throw new Error("SLOT_CONFLICT");
    }
  }

  const dayStart = new Date(startsAt);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const blocks = await db
    .select()
    .from(teacherCalendarBlocks)
    .where(
      and(
        eq(teacherCalendarBlocks.teacherUserId, teacherUserId),
        lt(teacherCalendarBlocks.blockDate, dayEnd),
        gt(teacherCalendarBlocks.blockDate, new Date(dayStart.getTime() - 1)),
      ),
    );

  for (const block of blocks) {
    const blockDay = new Date(block.blockDate);
    blockDay.setHours(0, 0, 0, 0);
    if (blockDay.getTime() !== dayStart.getTime()) continue;
    if (!block.startTime && !block.endTime) {
      throw new Error("TEACHER_BLOCKED");
    }
  }
}

export function buildMeetUrl(appointmentId: string) {
  return `https://meet.google.com/lookup/${appointmentId.replace(/-/g, "").slice(0, 12)}`;
}

export async function scheduleAppointmentReminders(
  appointmentId: string,
  startsAt: Date,
) {
  const db = requireDb();
  const r24 = new Date(startsAt.getTime() - 24 * 60 * 60 * 1000);
  const r1 = new Date(startsAt.getTime() - 60 * 60 * 1000);
  const now = new Date();
  const rows = [
    { kind: "reminder_24h", scheduledFor: r24 },
    { kind: "reminder_1h", scheduledFor: r1 },
  ].filter((r) => r.scheduledFor > now);

  if (rows.length === 0) return;

  const { appointmentReminders } = await import("@/server/db/schema");
  await db.insert(appointmentReminders).values(
    rows.map((r) => ({
      appointmentId,
      kind: r.kind,
      scheduledFor: r.scheduledFor,
    })),
  );
}
