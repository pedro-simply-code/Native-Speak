import { and, eq, inArray } from "drizzle-orm";
import { requireDb } from "@/server/db";
import {
  classAppointments,
  teacherCalendarBlocks,
  teacherWeeklyAvailability,
} from "@/server/db/schema";

const LESSON_MS = 25 * 60 * 1000;

function parseHm(hm: string, base: Date) {
  const [h, m] = hm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

export type SlotOption = {
  startsAt: string;
  label: string;
};

export async function listTeacherAvailableSlots(
  teacherUserId: string,
  daysAhead = 14,
  maxSlots = 40,
): Promise<SlotOption[]> {
  const db = requireDb();
  const weekly = await db
    .select()
    .from(teacherWeeklyAvailability)
    .where(eq(teacherWeeklyAvailability.teacherUserId, teacherUserId));

  if (weekly.length === 0) return [];

  const now = new Date();
  const out: SlotOption[] = [];

  for (let d = 0; d < daysAhead && out.length < maxSlots; d++) {
    const day = new Date(now);
    day.setDate(day.getDate() + d);
    day.setHours(0, 0, 0, 0);
    const dow = day.getDay();

    const dayRules = weekly.filter((w) => w.dayOfWeek === dow);
    if (dayRules.length === 0) continue;

    const blocks = await db
      .select()
      .from(teacherCalendarBlocks)
      .where(eq(teacherCalendarBlocks.teacherUserId, teacherUserId));

    const blockedAllDay = blocks.some((b) => {
      const bd = new Date(b.blockDate);
      bd.setHours(0, 0, 0, 0);
      return bd.getTime() === day.getTime() && !b.startTime && !b.endTime;
    });
    if (blockedAllDay) continue;

    const booked = await db
      .select({
        startsAt: classAppointments.startsAt,
        endsAt: classAppointments.endsAt,
      })
      .from(classAppointments)
      .where(
        and(
          eq(classAppointments.teacherUserId, teacherUserId),
          inArray(classAppointments.status, ["scheduled"]),
        ),
      );

    for (const rule of dayRules) {
      let cursor = parseHm(rule.startTime, day);
      const endBound = parseHm(rule.endTime, day);

      while (cursor.getTime() + LESSON_MS <= endBound.getTime() && out.length < maxSlots) {
        const slotEnd = new Date(cursor.getTime() + LESSON_MS);
        if (cursor > now) {
          const overlaps = booked.some(
            (b) => cursor < b.endsAt && slotEnd > b.startsAt,
          );
          if (!overlaps) {
            out.push({
              startsAt: cursor.toISOString(),
              label: cursor.toLocaleString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }),
            });
          }
        }
        cursor = new Date(cursor.getTime() + LESSON_MS);
      }
    }
  }

  return out;
}
