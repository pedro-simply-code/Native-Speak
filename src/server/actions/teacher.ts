"use server";

import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { requireDb, requireDbAtRequest } from "@/server/db";
import {
  classAppointments,
  students,
  teacherCalendarBlocks,
  teacherProfiles,
  teacherWeeklyAvailability,
  users,
} from "@/server/db/schema";

const slotSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const blockSchema = z.object({
  blockDate: z.string().min(8),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().max(200).optional(),
});

const noteSchema = z.object({
  appointmentId: z.string().uuid(),
  lessonNote: z.string().max(4000),
  taught: z.boolean(),
});

export async function getTeacherProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const db = await requireDbAtRequest();
  const [row] = await db
    .select()
    .from(teacherProfiles)
    .where(eq(teacherProfiles.userId, session.user.id))
    .limit(1);
  return row ?? null;
}

export async function listWeeklyAvailability() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const db = await requireDbAtRequest();
  return db
    .select()
    .from(teacherWeeklyAvailability)
    .where(eq(teacherWeeklyAvailability.teacherUserId, session.user.id));
}

export async function addWeeklySlot(input: z.infer<typeof slotSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };
  const parsed = slotSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid slot." };

  const db = requireDb();
  await db.insert(teacherWeeklyAvailability).values({
    teacherUserId: session.user.id,
    dayOfWeek: parsed.data.dayOfWeek,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
  });
  return { ok: true as const };
}

export async function listCalendarBlocks() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const db = await requireDbAtRequest();
  return db
    .select()
    .from(teacherCalendarBlocks)
    .where(eq(teacherCalendarBlocks.teacherUserId, session.user.id));
}

export async function addCalendarBlock(input: z.infer<typeof blockSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };
  const parsed = blockSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid block." };

  const db = requireDb();
  await db.insert(teacherCalendarBlocks).values({
    teacherUserId: session.user.id,
    blockDate: new Date(parsed.data.blockDate),
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
    reason: parsed.data.reason,
  });
  return { ok: true as const };
}

export async function listTeacherAppointments(upcoming: boolean) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const db = await requireDbAtRequest();
  const now = new Date();
  const condition = upcoming
    ? gte(classAppointments.startsAt, now)
    : lte(classAppointments.endsAt, now);

  return db
    .select({
      id: classAppointments.id,
      startsAt: classAppointments.startsAt,
      endsAt: classAppointments.endsAt,
      status: classAppointments.status,
      lessonNote: classAppointments.lessonNote,
      taught: classAppointments.taught,
      studentFirstName: students.firstName,
      studentLastName: students.lastName,
      familyEmail: users.email,
    })
    .from(classAppointments)
    .leftJoin(students, eq(students.id, classAppointments.studentId))
    .innerJoin(users, eq(users.id, classAppointments.familyUserId))
    .where(
      and(eq(classAppointments.teacherUserId, session.user.id), condition),
    );
}

export async function saveAppointmentNote(input: z.infer<typeof noteSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid note." };

  const db = requireDb();
  const [appt] = await db
    .select()
    .from(classAppointments)
    .where(
      and(
        eq(classAppointments.id, parsed.data.appointmentId),
        eq(classAppointments.teacherUserId, session.user.id),
      ),
    )
    .limit(1);
  if (!appt) return { ok: false as const, error: "Not found." };

  await db
    .update(classAppointments)
    .set({
      lessonNote: parsed.data.lessonNote,
      taught: parsed.data.taught,
      status: parsed.data.taught ? "completed" : "no_show",
      updatedAt: new Date(),
    })
    .where(eq(classAppointments.id, parsed.data.appointmentId));

  if (parsed.data.taught) {
    const { consumeHeldCreditOnComplete } = await import(
      "@/lib/scheduling/credits"
    );
    await consumeHeldCreditOnComplete(appt.familyUserId, appt.id);
    const { accrueTeacherPayout } = await import("@/server/actions/payouts");
    await accrueTeacherPayout(session.user.id, appt.id);
  }

  return { ok: true as const };
}

const materialSchema = z.object({
  appointmentId: z.string().min(1),
  title: z.string().min(1).max(120),
  url: z.string().url().max(500),
});

export async function uploadLessonMaterialFile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };

  const appointmentId = String(formData.get("appointmentId") ?? "");
  const title = String(formData.get("title") ?? "Lesson material");
  const file = formData.get("file");

  if (!appointmentId || !(file instanceof File)) {
    return { ok: false as const, error: "Missing file or appointment." };
  }

  const db = requireDb();
  const [appt] = await db
    .select({ id: classAppointments.id })
    .from(classAppointments)
    .where(
      and(
        eq(classAppointments.id, appointmentId),
        eq(classAppointments.teacherUserId, session.user.id),
      ),
    )
    .limit(1);
  if (!appt) return { ok: false as const, error: "Not found." };

  try {
    const { saveLessonMaterialFile } = await import("@/lib/storage/lesson-uploads");
    const saved = await saveLessonMaterialFile(file);
    const { lessonMaterials } = await import("@/server/db/schema");
    await db.insert(lessonMaterials).values({
      appointmentId,
      title,
      url: saved.publicUrl,
      storagePath: saved.storagePath,
      mimeType: saved.mimeType,
      uploadedByUserId: session.user.id,
    });
    return { ok: true as const, url: saved.publicUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UPLOAD_FAILED";
    if (msg === "FILE_TOO_LARGE") {
      return { ok: false as const, error: "File too large (max 8MB)." };
    }
    if (msg === "UNSUPPORTED_TYPE") {
      return { ok: false as const, error: "Unsupported file type." };
    }
    return { ok: false as const, error: "Upload failed." };
  }
}

export async function attachLessonMaterial(
  input: z.infer<typeof materialSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };
  const parsed = materialSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid material." };

  const db = requireDb();
  const [appt] = await db
    .select({ id: classAppointments.id })
    .from(classAppointments)
    .where(
      and(
        eq(classAppointments.id, parsed.data.appointmentId),
        eq(classAppointments.teacherUserId, session.user.id),
      ),
    )
    .limit(1);
  if (!appt) return { ok: false as const, error: "Not found." };

  const { lessonMaterials } = await import("@/server/db/schema");
  await db.insert(lessonMaterials).values({
    appointmentId: parsed.data.appointmentId,
    title: parsed.data.title,
    url: parsed.data.url,
    uploadedByUserId: session.user.id,
  });

  return { ok: true as const };
}

export async function listAssignedStudents() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const db = await requireDbAtRequest();
  return db
    .selectDistinct({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      age: students.age,
      grade: students.grade,
      proficiency: students.proficiency,
      familyEmail: users.email,
    })
    .from(classAppointments)
    .innerJoin(students, eq(students.id, classAppointments.studentId))
    .innerJoin(users, eq(users.id, classAppointments.familyUserId))
    .where(eq(classAppointments.teacherUserId, session.user.id));
}
