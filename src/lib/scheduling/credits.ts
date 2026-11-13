import { and, eq, sql } from "drizzle-orm";
import { CLASS_PACKAGES } from "@/lib/platform/profile-options";
import { requireDb } from "@/server/db";
import {
  creditLedger,
  familyClassCredits,
  classAppointments,
} from "@/server/db/schema";

export async function getFamilyCreditBalance(familyUserId: string) {
  const db = requireDb();
  const [row] = await db
    .select({ balance: familyClassCredits.balance })
    .from(familyClassCredits)
    .where(eq(familyClassCredits.familyUserId, familyUserId))
    .limit(1);
  return row?.balance ?? 0;
}

async function ensureWallet(familyUserId: string) {
  const db = requireDb();
  await db
    .insert(familyClassCredits)
    .values({ familyUserId, balance: 0 })
    .onConflictDoNothing();
}

async function appendLedger(
  familyUserId: string,
  delta: number,
  reason: string,
  refs: {
    paymentId?: string;
    appointmentId?: string;
    changeRequestId?: string;
  } = {},
) {
  const db = requireDb();
  await ensureWallet(familyUserId);
  await db.insert(creditLedger).values({
    familyUserId,
    delta,
    reason,
    paymentId: refs.paymentId,
    appointmentId: refs.appointmentId,
    changeRequestId: refs.changeRequestId,
  });
  await db
    .update(familyClassCredits)
    .set({
      balance: sql`${familyClassCredits.balance} + ${delta}`,
      updatedAt: new Date(),
    })
    .where(eq(familyClassCredits.familyUserId, familyUserId));
}

export function classesForPackageId(packageId: string) {
  const pkg = CLASS_PACKAGES.find((p) => p.id === packageId);
  return pkg?.classes ?? 0;
}

export async function grantCreditsForPayment(
  familyUserId: string,
  paymentId: string,
  packageId: string,
) {
  const classes = classesForPackageId(packageId);
  if (classes <= 0) return;
  await appendLedger(familyUserId, classes, `purchase:${packageId}`, {
    paymentId,
  });
}

/** Reverses unused package credits when a payment is refunded (ledger-aware). */
export async function revokeCreditsForRefundedPayment(
  familyUserId: string,
  paymentId: string,
  packageId: string | undefined,
) {
  const db = requireDb();
  const [purchase] = await db
    .select({ delta: creditLedger.delta })
    .from(creditLedger)
    .where(
      and(
        eq(creditLedger.paymentId, paymentId),
        sql`${creditLedger.delta} > 0`,
      ),
    )
    .limit(1);
  const granted = purchase?.delta ?? (packageId ? classesForPackageId(packageId) : 0);
  if (granted <= 0) return;

  const balance = await getFamilyCreditBalance(familyUserId);
  const delta = -Math.min(granted, balance);
  if (delta === 0) return;

  await appendLedger(familyUserId, delta, `refund:${paymentId}`, { paymentId });
}

export async function holdCreditForAppointment(
  familyUserId: string,
  appointmentId: string,
) {
  const balance = await getFamilyCreditBalance(familyUserId);
  if (balance < 1) {
    throw new Error("INSUFFICIENT_CREDITS");
  }
  await appendLedger(familyUserId, -1, "hold:booking", { appointmentId });
  await requireDb()
    .update(classAppointments)
    .set({ creditHeld: true, updatedAt: new Date() })
    .where(eq(classAppointments.id, appointmentId));
}

export async function releaseHeldCredit(
  familyUserId: string,
  appointmentId: string,
) {
  const db = requireDb();
  const [appt] = await db
    .select({ creditHeld: classAppointments.creditHeld })
    .from(classAppointments)
    .where(eq(classAppointments.id, appointmentId))
    .limit(1);
  if (!appt?.creditHeld) return;
  await appendLedger(familyUserId, 1, "release:cancel", { appointmentId });
  await db
    .update(classAppointments)
    .set({ creditHeld: false, updatedAt: new Date() })
    .where(eq(classAppointments.id, appointmentId));
}

export async function applyCreditPenalty(
  familyUserId: string,
  credits: number,
  changeRequestId: string,
  appointmentId: string,
) {
  if (credits <= 0) return;
  await appendLedger(familyUserId, -credits, "penalty:late_change", {
    changeRequestId,
    appointmentId,
  });
}

export async function consumeHeldCreditOnComplete(
  familyUserId: string,
  appointmentId: string,
) {
  const db = requireDb();
  const [appt] = await db
    .select({ creditHeld: classAppointments.creditHeld })
    .from(classAppointments)
    .where(eq(classAppointments.id, appointmentId))
    .limit(1);
  if (!appt?.creditHeld) return;
  await db
    .update(classAppointments)
    .set({ creditHeld: false, updatedAt: new Date() })
    .where(eq(classAppointments.id, appointmentId));
  await appendLedger(familyUserId, 0, "consume:completed", { appointmentId });
}

export async function incrementFreeRescheduleUsed(familyUserId: string) {
  const db = requireDb();
  await ensureWallet(familyUserId);
  await db
    .update(familyClassCredits)
    .set({
      freeReschedulesUsed: sql`${familyClassCredits.freeReschedulesUsed} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(familyClassCredits.familyUserId, familyUserId));
}
