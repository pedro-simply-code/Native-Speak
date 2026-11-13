"use server";

import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { NOTIFICATION_ROUTES } from "@/lib/notifications/catalog";
import { requireDb, requireDbAtRequest } from "@/server/db";
import { teacherApplications, teacherProfiles, users } from "@/server/db/schema";
import {
  notifyRoles,
  notifyUser,
} from "@/server/notifications/service";

const submitSchema = z.object({
  documentUrls: z
    .array(z.string().url().max(2000))
    .min(1, "Add at least one document URL."),
});

export async function submitTeacherApplication(
  input: z.infer<typeof submitSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "Unauthorized." };
  }
  const roles = session.user.roles ?? [];
  if (!roles.includes("teacher")) {
    return { ok: false as const, error: "Teachers only." };
  }

  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid." };
  }

  const db = requireDb();
  const [row] = await db
    .insert(teacherApplications)
    .values({
      userId: session.user.id,
      documentUrls: parsed.data.documentUrls,
      status: "submitted",
    })
    .returning({ id: teacherApplications.id });

  const name = session.user.name ?? session.user.email ?? "A teacher";
  const href =
    NOTIFICATION_ROUTES["teacher.application_submitted"] ??
    "/dashboard/manager/applications";

  await notifyRoles(["admin", "manager"], {
    kind: "teacher.application_submitted",
    title: "New teacher application",
    body: `${name} uploaded ${parsed.data.documentUrls.length} document(s) for review.`,
    href,
    meta: {
      audience: "staff",
      applicationId: row?.id,
      userId: session.user.id,
      name,
      count: String(parsed.data.documentUrls.length),
    },
  });

  await notifyUser(session.user.id, {
    kind: "teacher.application_submitted",
    title: "Application received",
    body: "We notified managers. You will hear back after review.",
    href: "/dashboard/teacher",
    meta: { audience: "self", applicationId: row?.id },
  });

  return { ok: true as const, applicationId: row?.id };
}

export async function listTeacherApplicationsQueue() {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  if (!hasPermission(roles, "teachers.approve")) return [];

  const db = await requireDbAtRequest();
  return db
    .select({
      application: teacherApplications,
      name: users.name,
      email: users.email,
    })
    .from(teacherApplications)
    .innerJoin(users, eq(users.id, teacherApplications.userId))
    .where(
      inArray(teacherApplications.status, ["submitted", "under_review"]),
    )
    .orderBy(desc(teacherApplications.createdAt));
}

const reviewSchema = z.object({
  applicationId: z.string().min(1),
  approve: z.boolean(),
  reviewNote: z.string().max(2000).optional(),
});

export async function reviewTeacherApplication(
  input: z.infer<typeof reviewSchema>,
) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  if (!session?.user?.id || !hasPermission(roles, "teachers.approve")) {
    return { ok: false as const, error: "Forbidden." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid request." };
  }

  const db = requireDb();
  const [row] = await db
    .select()
    .from(teacherApplications)
    .where(eq(teacherApplications.id, parsed.data.applicationId))
    .limit(1);

  if (!row) return { ok: false as const, error: "Application not found." };
  if (row.status !== "submitted" && row.status !== "under_review") {
    return { ok: false as const, error: "Application already reviewed." };
  }

  const status = parsed.data.approve ? "approved" : "rejected";
  await db
    .update(teacherApplications)
    .set({
      status,
      reviewedBy: session.user.id,
      reviewNote: parsed.data.reviewNote,
      updatedAt: new Date(),
    })
    .where(eq(teacherApplications.id, row.id));

  if (parsed.data.approve) {
    await db
      .update(teacherProfiles)
      .set({ status: "active", updatedAt: new Date() })
      .where(eq(teacherProfiles.userId, row.userId));
  }

  await notifyUser(row.userId, {
    kind: "teacher.application_submitted",
    title: parsed.data.approve
      ? "Application approved"
      : "Application not approved",
    body: parsed.data.approve
      ? "You can take live classes once your profile and availability are complete."
      : parsed.data.reviewNote?.trim()
        ? parsed.data.reviewNote.trim()
        : "Contact your manager if you have questions.",
    href: "/dashboard/teacher",
    meta: { audience: "self", applicationId: row.id, decision: status },
  });

  return { ok: true as const, status };
}
