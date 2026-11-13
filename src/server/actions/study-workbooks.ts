"use server";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { requireDb, requireDbAtRequest } from "@/server/db";
import {
  type StudyBlock,
  studyProgressLogs,
  studyWorkbooks,
  users,
} from "@/server/db/schema";

const blockSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1),
    type: z.literal("note"),
    title: z.string().min(1).max(200),
    body: z.string().max(10_000),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("exercise"),
    title: z.string().min(1).max(200),
    instructions: z.string().max(5000),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("resource"),
    title: z.string().min(1).max(200),
    url: z.string().url().max(2000),
  }),
]);

const workbookSchema = z.object({
  id: z.string().optional(),
  familyUserId: z.string().min(1),
  studentId: z.string().optional(),
  appointmentId: z.string().optional(),
  title: z.string().min(2).max(300),
  description: z.string().max(2000).optional(),
  blocks: z.array(blockSchema),
  publish: z.boolean().optional(),
});

export async function listStudyWorkbooksForTeacher() {
  const session = await auth();
  if (!session?.user?.roles?.includes("teacher")) return [];
  const db = await requireDbAtRequest();
  return db
    .select({
      workbook: studyWorkbooks,
      familyEmail: users.email,
    })
    .from(studyWorkbooks)
    .innerJoin(users, eq(users.id, studyWorkbooks.familyUserId))
    .where(eq(studyWorkbooks.teacherUserId, session.user.id))
    .orderBy(desc(studyWorkbooks.updatedAt));
}

export async function listStudyWorkbooksForFamily() {
  const session = await auth();
  if (!session?.user?.roles?.includes("family")) return [];
  const db = await requireDbAtRequest();
  return db
    .select()
    .from(studyWorkbooks)
    .where(
      and(
        eq(studyWorkbooks.familyUserId, session.user.id),
        eq(studyWorkbooks.status, "published"),
      ),
    )
    .orderBy(desc(studyWorkbooks.updatedAt));
}

export async function getStudyWorkbookWithProgress(workbookId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const db = await requireDbAtRequest();
  const [wb] = await db
    .select()
    .from(studyWorkbooks)
    .where(eq(studyWorkbooks.id, workbookId))
    .limit(1);
  if (!wb) return null;

  const roles = session.user.roles ?? [];
  const isTeacher = roles.includes("teacher") && wb.teacherUserId === session.user.id;
  const isFamily = roles.includes("family") && wb.familyUserId === session.user.id;
  if (!isTeacher && !isFamily && !roles.includes("admin")) return null;

  const progress = await db
    .select()
    .from(studyProgressLogs)
    .where(
      and(
        eq(studyProgressLogs.workbookId, workbookId),
        eq(studyProgressLogs.familyUserId, wb.familyUserId),
      ),
    );

  return { workbook: wb, progress };
}

export async function upsertStudyWorkbook(input: z.infer<typeof workbookSchema>) {
  const session = await auth();
  if (!session?.user?.roles?.includes("teacher")) {
    return { ok: false as const, error: "Teachers only." };
  }

  const parsed = workbookSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid workbook." };
  }

  const db = requireDb();
  const status = parsed.data.publish ? ("published" as const) : ("draft" as const);
  const blocks = parsed.data.blocks as StudyBlock[];
  const now = new Date();

  if (parsed.data.id) {
    const [owned] = await db
      .select({ id: studyWorkbooks.id })
      .from(studyWorkbooks)
      .where(
        and(
          eq(studyWorkbooks.id, parsed.data.id),
          eq(studyWorkbooks.teacherUserId, session.user.id),
        ),
      )
      .limit(1);
    if (!owned) return { ok: false as const, error: "Not found." };

    await db
      .update(studyWorkbooks)
      .set({
        familyUserId: parsed.data.familyUserId,
        studentId: parsed.data.studentId ?? null,
        appointmentId: parsed.data.appointmentId ?? null,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        blocks,
        status,
        updatedAt: now,
      })
      .where(eq(studyWorkbooks.id, parsed.data.id));

    return { ok: true as const, id: parsed.data.id };
  }

  const [row] = await db
    .insert(studyWorkbooks)
    .values({
      teacherUserId: session.user.id,
      familyUserId: parsed.data.familyUserId,
      studentId: parsed.data.studentId ?? null,
      appointmentId: parsed.data.appointmentId ?? null,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      blocks,
      status,
    })
    .returning({ id: studyWorkbooks.id });

  return { ok: true as const, id: row?.id };
}

export async function saveStudyProgress(input: {
  workbookId: string;
  blockId: string;
  reflection?: string;
  completed?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.roles?.includes("family")) {
    return { ok: false as const, error: "Families only." };
  }

  const db = requireDb();
  const [wb] = await db
    .select()
    .from(studyWorkbooks)
    .where(
      and(
        eq(studyWorkbooks.id, input.workbookId),
        eq(studyWorkbooks.familyUserId, session.user.id),
        eq(studyWorkbooks.status, "published"),
      ),
    )
    .limit(1);
  if (!wb) return { ok: false as const, error: "Workbook not found." };

  const blockOk = (wb.blocks as StudyBlock[]).some((b) => b.id === input.blockId);
  if (!blockOk) return { ok: false as const, error: "Unknown section." };

  const [existing] = await db
    .select({ id: studyProgressLogs.id })
    .from(studyProgressLogs)
    .where(
      and(
        eq(studyProgressLogs.workbookId, input.workbookId),
        eq(studyProgressLogs.familyUserId, session.user.id),
        eq(studyProgressLogs.blockId, input.blockId),
      ),
    )
    .limit(1);

  const payload = {
    reflection: input.reflection ?? null,
    completed: input.completed ?? false,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(studyProgressLogs)
      .set(payload)
      .where(eq(studyProgressLogs.id, existing.id));
  } else {
    await db.insert(studyProgressLogs).values({
      workbookId: input.workbookId,
      familyUserId: session.user.id,
      blockId: input.blockId,
      ...payload,
    });
  }

  return { ok: true as const };
}
