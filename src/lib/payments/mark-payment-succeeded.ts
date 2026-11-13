import { and, eq, inArray } from "drizzle-orm";
import { grantCreditsForPayment } from "@/lib/scheduling/credits";
import { NOTIFICATION_ROUTES } from "@/lib/notifications/catalog";
import { requireDb } from "@/server/db";
import { payments, users } from "@/server/db/schema";
import { notifyRoles } from "@/server/notifications/service";

export async function markPaymentSucceeded(
  paymentId: string,
  input: {
    provider: "stripe" | "paypal";
    externalId?: string;
    simulated?: boolean;
  },
) {
  const db = requireDb();

  const [existing] = await db
    .select({
      id: payments.id,
      status: payments.status,
      userId: payments.userId,
      amountCents: payments.amountCents,
      currency: payments.currency,
      metadata: payments.metadata,
    })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!existing) return null;
  if (existing.status !== "pending" && existing.status !== "requires_action") {
    return existing;
  }

  const meta = {
    ...(existing.metadata ?? {}),
    ...(input.simulated ? { simulated: "true" } : {}),
  };

  // Atomic transition: concurrent webhook + return-URL verifications (or Stripe
  // retries) only grant credits once.
  const updated = await db
    .update(payments)
    .set({
      status: "succeeded",
      externalId: input.externalId ?? existing.id,
      metadata: meta,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(payments.id, paymentId),
        inArray(payments.status, ["pending", "requires_action"]),
      ),
    )
    .returning({
      id: payments.id,
      userId: payments.userId,
      amountCents: payments.amountCents,
      currency: payments.currency,
    });

  const pay = updated[0];
  if (!pay) {
    const [current] = await db
      .select({
        id: payments.id,
        status: payments.status,
        userId: payments.userId,
        amountCents: payments.amountCents,
        currency: payments.currency,
        metadata: payments.metadata,
      })
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);
    return current ?? null;
  }

  const packageId = existing.metadata?.packageId;
  if (packageId) {
    await grantCreditsForPayment(pay.userId, pay.id, packageId);
  }

  const [user] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, pay.userId))
    .limit(1);

  const who = user?.name ?? user?.email ?? "Customer";
  const amountLabel = `$${(pay.amountCents / 100).toFixed(2)} ${pay.currency.toUpperCase()}`;
  const simulatedNote = input.simulated ? " (simulated)" : "";

  await notifyRoles(["admin"], {
    kind: "payment.received",
    title: input.provider === "paypal"
      ? "Payment received (PayPal)"
      : "Payment received",
    body: `${who} paid ${amountLabel}${simulatedNote}.`,
    href: NOTIFICATION_ROUTES["payment.received"],
    meta: {
      paymentId: pay.id,
      userId: pay.userId,
      who,
      amount: amountLabel,
      provider: input.provider,
      simulated: input.simulated ?? false,
    },
  });

  return pay;
}
