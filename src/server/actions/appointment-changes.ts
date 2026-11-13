"use server";

import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import type { AppRole } from "@/lib/auth/roles";
import { pickPrimaryRole } from "@/lib/auth/roles";
import {
  applyCreditPenalty,
  getFamilyCreditBalance,
  incrementFreeRescheduleUsed,
  releaseHeldCredit,
} from "@/lib/scheduling/credits";
import {
  evaluateCancelPolicy,
  evaluateReschedulePolicy,
  getSchedulingPolicy,
  type ChangeReason,
} from "@/lib/scheduling/policy";
import {
  assertTeacherSlotAvailable,
  buildMeetUrl,
  scheduleAppointmentReminders,
} from "@/lib/scheduling/slots";
import { NOTIFICATION_ROUTES } from "@/lib/notifications/catalog";
import { requireDb, requireDbAtRequest } from "@/server/db";
import {
  appointmentChangeRequests,
  classAppointments,
  familyClassCredits,
  students,
  users,
} from "@/server/db/schema";
import { notifyRoles, notifyUser } from "@/server/notifications/service";

const changeSchema = z.object({
  appointmentId: z.string().min(1),
  requestType: z.enum(["cancel", "reschedule"]),
  reasonCode: z.enum([
    "schedule_conflict",
    "illness",
    "emergency",
    "travel",
    "teacher_unavailable",
    "system_error",
    "other",
  ]),
  reasonText: z.string().max(2000).optional(),
  proposedStartsAt: z.string().optional(),
});

function roleFromSession(roles: AppRole[]): AppRole {
  return pickPrimaryRole(roles) ?? roles[0] ?? "family";
}

async function loadAppointment(appointmentId: string) {
  const db = requireDb();
  const [row] = await db
    .select()
    .from(classAppointments)
    .where(eq(classAppointments.id, appointmentId))
    .limit(1);
  return row ?? null;
}

async function applyCancel(
  appointmentId: string,
  penaltyCredits: number,
  changeRequestId: string,
) {
  const db = requireDb();
  const appt = await loadAppointment(appointmentId);
  if (!appt) return;

  await releaseHeldCredit(appt.familyUserId, appointmentId);
  if (penaltyCredits > 0) {
    await applyCreditPenalty(
      appt.familyUserId,
      penaltyCredits,
      changeRequestId,
      appointmentId,
    );
  }

  await db
    .update(classAppointments)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(classAppointments.id, appointmentId));

  await notifyUser(appt.teacherUserId, {
    kind: "appointment.cancelled",
    title: "Class cancelled",
    body: `A class on ${appt.startsAt.toLocaleString()} was cancelled.`,
    href: NOTIFICATION_ROUTES["appointment.cancelled"],
    meta: { appointmentId },
  });
  await notifyUser(appt.familyUserId, {
    kind: "appointment.cancelled",
    title: "Class cancelled",
    body: `Your class on ${appt.startsAt.toLocaleString()} was cancelled.`,
    href: "/dashboard/family/classes",
    meta: { appointmentId },
  });
}

async function applyReschedule(
  appt: typeof classAppointments.$inferSelect,
  newStart: Date,
  newEnd: Date,
  penaltyCredits: number,
  changeRequestId: string,
) {
  const db = requireDb();

  await assertTeacherSlotAvailable(
    appt.teacherUserId,
    newStart,
    newEnd,
    appt.id,
  );

  const newId = crypto.randomUUID();
  const [created] = await db
    .insert(classAppointments)
    .values({
      id: newId,
      teacherUserId: appt.teacherUserId,
      familyUserId: appt.familyUserId,
      studentId: appt.studentId,
      startsAt: newStart,
      endsAt: newEnd,
      status: "scheduled",
      meetingUrl: buildMeetUrl(newId),
      rescheduledFromId: appt.id,
      creditHeld: appt.creditHeld,
    })
    .returning();

  if (!created) throw new Error("RESCHEDULE_FAILED");

  await db
    .update(classAppointments)
    .set({
      status: "rescheduled",
      rescheduledToId: created.id,
      updatedAt: new Date(),
    })
    .where(eq(classAppointments.id, appt.id));

  if (penaltyCredits > 0) {
    await applyCreditPenalty(
      appt.familyUserId,
      penaltyCredits,
      changeRequestId,
      appt.id,
    );
  }

  await incrementFreeRescheduleUsed(appt.familyUserId);
  await scheduleAppointmentReminders(created.id, newStart);

  await notifyUser(appt.teacherUserId, {
    kind: "appointment.reschedule_requested",
    title: "Class rescheduled",
    body: `New time: ${newStart.toLocaleString()}.`,
    href: NOTIFICATION_ROUTES["appointment.booked"],
    meta: { appointmentId: created.id },
  });
  await notifyUser(appt.familyUserId, {
    kind: "appointment.change_reviewed",
    title: "Class rescheduled",
    body: `Your class was moved to ${newStart.toLocaleString()}.`,
    href: "/dashboard/family/classes",
    meta: { appointmentId: created.id },
  });
}

export async function requestAppointmentChange(
  input: z.infer<typeof changeSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };

  const parsed = changeSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  const appt = await loadAppointment(parsed.data.appointmentId);
  if (!appt) return { ok: false as const, error: "Class not found." };
  if (appt.status !== "scheduled") {
    return { ok: false as const, error: "This class can no longer be changed." };
  }

  const roles = session.user.roles ?? [];
  const actorRole = roleFromSession(roles);
  const isFamily = appt.familyUserId === session.user.id;
  const isTeacher = appt.teacherUserId === session.user.id;
  const isStaff = roles.includes("admin") || roles.includes("manager");

  if (!isFamily && !isTeacher && !isStaff) {
    return { ok: false as const, error: "Forbidden." };
  }

  const policy = await getSchedulingPolicy();
  const db = requireDb();

  const [wallet] = await db
    .select({ freeReschedulesUsed: familyClassCredits.freeReschedulesUsed })
    .from(familyClassCredits)
    .where(eq(familyClassCredits.familyUserId, appt.familyUserId))
    .limit(1);

  const decision =
    parsed.data.requestType === "cancel"
      ? evaluateCancelPolicy({
          policy,
          startsAt: appt.startsAt,
          reasonCode: parsed.data.reasonCode as ChangeReason,
          requestedByRole: actorRole,
        })
      : evaluateReschedulePolicy({
          policy,
          startsAt: appt.startsAt,
          reasonCode: parsed.data.reasonCode as ChangeReason,
          requestedByRole: actorRole,
          freeReschedulesUsed: wallet?.freeReschedulesUsed ?? 0,
        });

  if (parsed.data.requestType === "reschedule") {
    if (!parsed.data.proposedStartsAt) {
      return { ok: false as const, error: "Proposed time required." };
    }
    const proposed = new Date(parsed.data.proposedStartsAt);
    if (Number.isNaN(proposed.getTime()) || proposed <= new Date()) {
      return { ok: false as const, error: "Invalid proposed time." };
    }
  }

  const [request] = await db
    .insert(appointmentChangeRequests)
    .values({
      appointmentId: appt.id,
      requestType: parsed.data.requestType,
      requestedByUserId: session.user.id,
      requestedByRole: actorRole,
      reasonCode: parsed.data.reasonCode,
      reasonText: parsed.data.reasonText,
      proposedStartsAt:
        parsed.data.requestType === "reschedule" && parsed.data.proposedStartsAt
          ? new Date(parsed.data.proposedStartsAt)
          : undefined,
      proposedEndsAt:
        parsed.data.requestType === "reschedule" && parsed.data.proposedStartsAt
          ? new Date(
              new Date(parsed.data.proposedStartsAt).getTime() + 25 * 60 * 1000,
            )
          : undefined,
      penaltyCredits: decision.penaltyCredits,
      status: decision.autoApprove ? "approved" : "pending",
      resolvedAt: decision.autoApprove ? new Date() : undefined,
    })
    .returning();

  if (!request) return { ok: false as const, error: "Could not save request." };

  if (decision.autoApprove) {
    if (parsed.data.requestType === "cancel") {
      await applyCancel(appt.id, decision.penaltyCredits, request.id);
    } else if (request.proposedStartsAt && request.proposedEndsAt) {
      await applyReschedule(
        appt,
        request.proposedStartsAt,
        request.proposedEndsAt,
        decision.penaltyCredits,
        request.id,
      );
    }
    return { ok: true as const, status: "approved" as const };
  }

  await notifyRoles(["manager", "admin"], {
    kind: "appointment.reschedule_requested",
    title: "Change request needs review",
    body: `${parsed.data.requestType} for class ${appt.startsAt.toLocaleString()} — reason: ${parsed.data.reasonCode}.`,
    href: "/dashboard/manager/schedule-requests",
    meta: { changeRequestId: request.id, appointmentId: appt.id },
  });

  return { ok: true as const, status: "pending" as const };
}

const reviewSchema = z.object({
  changeRequestId: z.string().min(1),
  approve: z.boolean(),
  reviewNote: z.string().max(2000).optional(),
  overridePenaltyCredits: z.number().int().min(0).max(10).optional(),
});

export async function reviewAppointmentChange(
  input: z.infer<typeof reviewSchema>,
) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };
  const roles = session.user.roles ?? [];
  if (!roles.includes("admin") && !roles.includes("manager")) {
    return { ok: false as const, error: "Forbidden." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid review." };

  const db = requireDb();
  const [request] = await db
    .select()
    .from(appointmentChangeRequests)
    .where(eq(appointmentChangeRequests.id, parsed.data.changeRequestId))
    .limit(1);

  if (!request || request.status !== "pending") {
    return { ok: false as const, error: "Request not found or already resolved." };
  }

  const appt = await loadAppointment(request.appointmentId);
  if (!appt) return { ok: false as const, error: "Class not found." };

  const penalty =
    parsed.data.overridePenaltyCredits ?? request.penaltyCredits;

  await db
    .update(appointmentChangeRequests)
    .set({
      status: parsed.data.approve ? "approved" : "denied",
      reviewedByUserId: session.user.id,
      reviewNote: parsed.data.reviewNote,
      penaltyCredits: penalty,
      resolvedAt: new Date(),
    })
    .where(eq(appointmentChangeRequests.id, request.id));

  if (parsed.data.approve) {
    if (request.requestType === "cancel") {
      await applyCancel(appt.id, penalty, request.id);
    } else if (request.proposedStartsAt && request.proposedEndsAt) {
      await applyReschedule(
        appt,
        request.proposedStartsAt,
        request.proposedEndsAt,
        penalty,
        request.id,
      );
    }
  }

  await notifyUser(request.requestedByUserId, {
    kind: "appointment.change_reviewed",
    title: parsed.data.approve ? "Request approved" : "Request denied",
    body: parsed.data.reviewNote
      ? parsed.data.reviewNote
      : parsed.data.approve
        ? "Your class change was approved."
        : "Your class change was denied.",
    href: "/dashboard/family/classes",
    meta: { changeRequestId: request.id },
  });

  return { ok: true as const };
}

export async function listPendingChangeRequests() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const roles = session.user.roles ?? [];
  if (!roles.includes("admin") && !roles.includes("manager")) return [];

  const db = await requireDbAtRequest();
  return db
    .select({
      request: appointmentChangeRequests,
      startsAt: classAppointments.startsAt,
      familyUserId: classAppointments.familyUserId,
      teacherUserId: classAppointments.teacherUserId,
    })
    .from(appointmentChangeRequests)
    .innerJoin(
      classAppointments,
      eq(classAppointments.id, appointmentChangeRequests.appointmentId),
    )
    .where(eq(appointmentChangeRequests.status, "pending"))
    .orderBy(desc(appointmentChangeRequests.createdAt));
}

export async function getFamilyCreditsSummary() {
  const session = await auth();
  if (!session?.user?.id) return { balance: 0, freeReschedulesUsed: 0 };
  return {
    balance: await getFamilyCreditBalance(session.user.id),
    freeReschedulesUsed: 0,
  };
}

export async function listFamilyAppointmentsDetailed(upcoming: boolean) {
  const session = await auth();
  if (!session?.user?.id) return [];
  const db = await requireDbAtRequest();
  const now = new Date();
  const rows = await db
    .select({
      id: classAppointments.id,
      startsAt: classAppointments.startsAt,
      endsAt: classAppointments.endsAt,
      status: classAppointments.status,
      meetingUrl: classAppointments.meetingUrl,
      lessonNote: classAppointments.lessonNote,
      taught: classAppointments.taught,
      studentFirstName: students.firstName,
      studentLastName: students.lastName,
      studentGrade: students.grade,
      studentProficiency: students.proficiency,
      teacherName: users.name,
      teacherEmail: users.email,
    })
    .from(classAppointments)
    .leftJoin(students, eq(students.id, classAppointments.studentId))
    .innerJoin(users, eq(users.id, classAppointments.teacherUserId))
    .where(
      and(
        eq(classAppointments.familyUserId, session.user.id),
        inArray(classAppointments.status, [
          "scheduled",
          "completed",
          "cancelled",
          "no_show",
          "rescheduled",
        ]),
      ),
    );

  return rows
    .filter((r) => (upcoming ? r.startsAt >= now : r.startsAt < now))
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}
