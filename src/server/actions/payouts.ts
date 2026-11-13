"use server";

import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { requireDb, requireDbAtRequest } from "@/server/db";
import { teacherPayouts } from "@/server/db/schema";

function payoutRateCents() {
  const raw = process.env.TEACHER_PAYOUT_CENTS_PER_CLASS;
  const n = raw ? Number.parseInt(raw, 10) : 2500;
  return Number.isFinite(n) && n > 0 ? n : 2500;
}

export async function accrueTeacherPayout(
  teacherUserId: string,
  appointmentId: string,
) {
  const db = requireDb();
  const [existing] = await db
    .select({ id: teacherPayouts.id })
    .from(teacherPayouts)
    .where(eq(teacherPayouts.appointmentId, appointmentId))
    .limit(1);
  if (existing) return;

  await db.insert(teacherPayouts).values({
    teacherUserId,
    appointmentId,
    amountCents: payoutRateCents(),
    status: "pending",
  });
}

export async function listTeacherPayoutsForAdmin() {
  const session = await auth();
  if (!session?.user?.roles?.includes("admin")) return [];

  const db = await requireDbAtRequest();
  return db
    .select()
    .from(teacherPayouts)
    .orderBy(desc(teacherPayouts.createdAt))
    .limit(100);
}

export async function listTeacherPayoutsSelf() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const db = await requireDbAtRequest();
  return db
    .select()
    .from(teacherPayouts)
    .where(eq(teacherPayouts.teacherUserId, session.user.id))
    .orderBy(desc(teacherPayouts.createdAt))
    .limit(50);
}

const markPaidSchema = z.object({
  payoutId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export async function markTeacherPayoutPaid(input: z.infer<typeof markPaidSchema>) {
  const session = await auth();
  if (!session?.user?.roles?.includes("admin")) {
    return { ok: false as const, error: "Forbidden." };
  }
  const parsed = markPaidSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid." };

  const db = requireDb();
  await db
    .update(teacherPayouts)
    .set({
      status: "paid",
      paidAt: new Date(),
      notes: parsed.data.notes,
    })
    .where(eq(teacherPayouts.id, parsed.data.payoutId));

  return { ok: true as const };
}
