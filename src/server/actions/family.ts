"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { requireDb, requireDbAtRequest } from "@/server/db";
import {
  familyProfiles,
  students,
  teacherProfiles,
  users,
} from "@/server/db/schema";

const studentSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email().optional().or(z.literal("")),
  age: z.coerce.number().int().min(3).max(99).optional(),
  grade: z.string().max(40).optional(),
  proficiency: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
});

const familyProfileSchema = z.object({
  residentialCity: z.string().max(80).optional(),
  residentialState: z.string().max(2).optional(),
  learnerType: z.enum(["self", "children"]),
  preferredTeacherId: z.string().optional(),
});

export async function upsertFamilyProfile(
  input: z.infer<typeof familyProfileSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };

  const parsed = familyProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid data." };

  const db = requireDb();
  const preferred =
    parsed.data.preferredTeacherId && parsed.data.preferredTeacherId.length > 0
      ? parsed.data.preferredTeacherId
      : null;

  await db
    .insert(familyProfiles)
    .values({
      userId: session.user.id,
      residentialCity: parsed.data.residentialCity,
      residentialState: parsed.data.residentialState,
      learnerType: parsed.data.learnerType,
      preferredTeacherId: preferred,
    })
  .onConflictDoUpdate({
    target: familyProfiles.userId,
    set: {
      residentialCity: parsed.data.residentialCity,
      residentialState: parsed.data.residentialState,
      learnerType: parsed.data.learnerType,
      preferredTeacherId: preferred,
      updatedAt: new Date(),
    },
  });

  return { ok: true as const };
}

export async function addStudent(input: z.infer<typeof studentSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };

  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid student." };

  const db = requireDb();
  await db.insert(students).values({
    familyUserId: session.user.id,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email || null,
    age: parsed.data.age,
    grade: parsed.data.grade,
    proficiency: parsed.data.proficiency,
  });

  return { ok: true as const };
}

export async function listFamilyStudents() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const db = await requireDbAtRequest();
  return db
    .select()
    .from(students)
    .where(eq(students.familyUserId, session.user.id));
}

export async function listActiveTeachers() {
  const db = await requireDbAtRequest();
  return db
    .select({
      userId: teacherProfiles.userId,
      name: users.name,
      email: users.email,
      timezone: teacherProfiles.timezone,
      status: teacherProfiles.status,
    })
    .from(teacherProfiles)
    .innerJoin(users, eq(users.id, teacherProfiles.userId))
    .where(eq(teacherProfiles.status, "active"));
}

export async function getFamilyProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const db = await requireDbAtRequest();
  const [row] = await db
    .select()
    .from(familyProfiles)
    .where(eq(familyProfiles.userId, session.user.id))
    .limit(1);
  return row ?? null;
}
