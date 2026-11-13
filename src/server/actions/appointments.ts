"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { NOTIFICATION_ROUTES } from "@/lib/notifications/catalog";
import {
  getFamilyCreditBalance,
  holdCreditForAppointment,
} from "@/lib/scheduling/credits";
import { createClassMeetLink } from "@/lib/google/meet";
import { hasAcceptedSchedulingPolicy } from "@/server/actions/policy-acceptance";
import { listTeacherAvailableSlots } from "@/lib/scheduling/available-slots";
import {
  assertTeacherSlotAvailable,
  scheduleAppointmentReminders,
} from "@/lib/scheduling/slots";
import { requireDb, requireDbAtRequest } from "@/server/db";
import {
  classAppointments,
  familyProfiles,
  students,
  teacherProfiles,
  users,
} from "@/server/db/schema";
import { notifyUser } from "@/server/notifications/service";

const bookSchema = z.object({
  teacherUserId: z.string().min(1),
  studentId: z.string().min(1),
  startsAt: z.string().min(8),
  savePreferredTeacher: z.boolean().optional(),
});

export async function bookFamilyClass(input: z.infer<typeof bookSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };

  const parsed = bookSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid booking." };

  const start = new Date(parsed.data.startsAt);
  if (Number.isNaN(start.getTime()) || start <= new Date()) {
    return { ok: false as const, error: "Choose a future date and time." };
  }
  const end = new Date(start.getTime() + 25 * 60 * 1000);

  const accepted = await hasAcceptedSchedulingPolicy(session.user.id);
  if (!accepted) {
    return {
      ok: false as const,
      error: "Accept the scheduling and cancellation policy before booking.",
    };
  }

  const balance = await getFamilyCreditBalance(session.user.id);
  if (balance < 1) {
    return {
      ok: false as const,
      error: "No class credits. Buy a package under Payments first.",
    };
  }

  const dbCheck = await requireDbAtRequest();
  const [teacherProfile] = await dbCheck
    .select({ status: teacherProfiles.status })
    .from(teacherProfiles)
    .where(eq(teacherProfiles.userId, parsed.data.teacherUserId))
    .limit(1);

  if (!teacherProfile || teacherProfile.status !== "active") {
    return {
      ok: false as const,
      error:
        "This teacher is not ready for bookings yet (credentials / manager approval still pending).",
    };
  }

  try {
    await assertTeacherSlotAvailable(parsed.data.teacherUserId, start, end);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "SLOT_CONFLICT";
    if (msg === "TEACHER_BLOCKED") {
      return { ok: false as const, error: "Teacher is not available that day." };
    }
    return {
      ok: false as const,
      error: "That time conflicts with another class.",
    };
  }

  const db = requireDb();
  const appointmentId = crypto.randomUUID();

  const [teacherUser, familyUser] = await Promise.all([
    db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, parsed.data.teacherUserId))
      .limit(1),
    db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1),
  ]);

  const meet = await createClassMeetLink(appointmentId, {
    teacherEmail: teacherUser[0]?.email ?? "teacher@example.com",
    familyEmail: familyUser[0]?.email ?? session.user.email ?? "family@example.com",
    startsAt: start,
    endsAt: end,
    summary: "Native Speak class",
  });

  await db.insert(classAppointments).values({
    id: appointmentId,
    teacherUserId: parsed.data.teacherUserId,
    familyUserId: session.user.id,
    studentId: parsed.data.studentId,
    startsAt: start,
    endsAt: end,
    status: "scheduled",
    meetingUrl: meet.meetingUrl,
    calendarEventId: meet.calendarEventId,
    creditHeld: true,
  });

  try {
    await holdCreditForAppointment(session.user.id, appointmentId);
  } catch {
    await db.delete(classAppointments).where(eq(classAppointments.id, appointmentId));
    return { ok: false as const, error: "Could not reserve a class credit." };
  }

  await scheduleAppointmentReminders(appointmentId, start);

  const familyName = session.user.name ?? session.user.email ?? "A family";
  const [student] = await db
    .select({ firstName: students.firstName, lastName: students.lastName })
    .from(students)
    .where(eq(students.id, parsed.data.studentId))
    .limit(1);
  const studentLabel = student
    ? `${student.firstName} ${student.lastName}`
    : "student";

  await notifyUser(parsed.data.teacherUserId, {
    kind: "appointment.booked",
    title: "New class scheduled",
    body: `${familyName} booked ${studentLabel} on ${start.toLocaleString()}.`,
    href: NOTIFICATION_ROUTES["appointment.booked"],
    meta: {
      familyUserId: session.user.id,
      studentId: parsed.data.studentId,
      family: familyName,
      student: studentLabel,
      when: start.toISOString(),
    },
  });

  if (parsed.data.savePreferredTeacher) {
    await db
      .insert(familyProfiles)
      .values({
        userId: session.user.id,
        preferredTeacherId: parsed.data.teacherUserId,
        learnerType: "children",
      })
      .onConflictDoUpdate({
        target: familyProfiles.userId,
        set: {
          preferredTeacherId: parsed.data.teacherUserId,
          updatedAt: new Date(),
        },
      });
  }

  return { ok: true as const, appointmentId };
}

export async function listFamilyAppointments(upcoming: boolean) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const db = await requireDbAtRequest();
  const now = new Date();

  const rows = await db
    .select()
    .from(classAppointments)
    .where(eq(classAppointments.familyUserId, session.user.id));

  return rows.filter((r) =>
    upcoming ? r.startsAt >= now && r.status === "scheduled" : r.startsAt < now,
  );
}

export async function fetchTeacherSlots(teacherUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  if (!teacherUserId) return [];
  return listTeacherAvailableSlots(teacherUserId);
}
