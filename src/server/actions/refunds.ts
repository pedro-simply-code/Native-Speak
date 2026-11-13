"use server";

import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { revokeCreditsForRefundedPayment } from "@/lib/scheduling/credits";
import { requireDb, requireDbAtRequest } from "@/server/db";
import { paymentRefunds, payments } from "@/server/db/schema";

async function markPaymentRefunded(paymentId: string) {
  const db = requireDb();
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);
  if (!payment) return;
  await db
    .update(payments)
    .set({ status: "refunded", updatedAt: new Date() })
    .where(eq(payments.id, payment.id));
  await revokeCreditsForRefundedPayment(
    payment.userId,
    payment.id,
    payment.metadata?.packageId,
  );
}

const requestSchema = z.object({
  paymentId: z.string().min(1),
  reason: z.string().min(3).max(2000),
  amountCents: z.coerce.number().int().positive().optional(),
});

export async function requestPaymentRefund(input: z.infer<typeof requestSchema>) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Unauthorized." };

  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  const db = requireDb();
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, parsed.data.paymentId))
    .limit(1);

  if (!payment) return { ok: false as const, error: "Payment not found." };
  const isOwner = payment.userId === session.user.id;
  const isAdmin = session.user.roles?.includes("admin");
  if (!isOwner && !isAdmin) {
    return { ok: false as const, error: "Forbidden." };
  }
  if (payment.status !== "succeeded") {
    return { ok: false as const, error: "Only succeeded payments can be refunded." };
  }

  const amount = parsed.data.amountCents ?? payment.amountCents;

  await db.insert(paymentRefunds).values({
    paymentId: payment.id,
    amountCents: amount,
    reason: parsed.data.reason,
    requestedByUserId: session.user.id,
    status: isAdmin ? "succeeded" : "pending",
    resolvedAt: isAdmin ? new Date() : undefined,
    reviewedByUserId: isAdmin ? session.user.id : undefined,
  });

  if (isAdmin) {
    await markPaymentRefunded(payment.id);
  }

  return { ok: true as const, status: isAdmin ? "succeeded" : "pending" };
}

export async function reviewPaymentRefund(input: {
  refundId: string;
  approve: boolean;
}) {
  const session = await auth();
  if (!session?.user?.roles?.includes("admin")) {
    return { ok: false as const, error: "Forbidden." };
  }

  const db = requireDb();
  const [refund] = await db
    .select()
    .from(paymentRefunds)
    .where(eq(paymentRefunds.id, input.refundId))
    .limit(1);
  if (!refund || refund.status !== "pending") {
    return { ok: false as const, error: "Refund not pending." };
  }

  const status = input.approve ? "succeeded" : "denied";
  await db
    .update(paymentRefunds)
    .set({
      status,
      resolvedAt: new Date(),
      reviewedByUserId: session.user.id,
    })
    .where(eq(paymentRefunds.id, refund.id));

  if (input.approve) {
    await markPaymentRefunded(refund.paymentId);
  }

  return { ok: true as const };
}

export async function listPaymentRefundsAdmin() {
  const session = await auth();
  if (!session?.user?.roles?.includes("admin")) return [];
  const db = await requireDbAtRequest();
  return db
    .select({
      refund: paymentRefunds,
      paymentUserId: payments.userId,
      paymentAmount: payments.amountCents,
    })
    .from(paymentRefunds)
    .innerJoin(payments, eq(payments.id, paymentRefunds.paymentId))
    .orderBy(desc(paymentRefunds.createdAt))
    .limit(100);
}
