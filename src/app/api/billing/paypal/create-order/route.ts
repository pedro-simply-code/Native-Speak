import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { isPayPalCheckoutSimulated } from "@/lib/payments/config";
import { createPayPalOrder } from "@/lib/payments/paypal";
import { completeSimulatedCheckout } from "@/lib/payments/simulate-checkout";
import { requireDb } from "@/server/db";
import { payments } from "@/server/db/schema";

const bodySchema = z.object({
  amountUsd: z.string().regex(/^\d+(\.\d{2})?$/),
  label: z.string().min(1).max(120),
  packageId: z.string().min(1).max(40),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = await getClientIp();
  const limit = await enforceRateLimit(`${session.user.id}:${ip}`, {
    bucket: "paypal-order",
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const amountCents = Math.round(parseFloat(parsed.data.amountUsd) * 100);

  try {
    const db = requireDb();
    const [payment] = await db
      .insert(payments)
      .values({
        userId: session.user.id,
        provider: "paypal",
        status: "pending",
        amountCents,
        currency: "usd",
        metadata: {
          label: parsed.data.label,
          packageId: parsed.data.packageId,
        },
      })
      .returning({ id: payments.id });

    if (!payment?.id) {
      return NextResponse.json({ error: "Could not create payment" }, { status: 500 });
    }

    if (isPayPalCheckoutSimulated()) {
      const simulated = await completeSimulatedCheckout(payment.id, "paypal");
      return NextResponse.json({
        id: `sim_paypal_${payment.id}`,
        approveUrl: simulated.redirectUrl,
        simulated: true,
      });
    }

    const order = await createPayPalOrder(
      parsed.data.amountUsd,
      payment?.id ?? "",
    );

    if (payment?.id) {
      await db
        .update(payments)
        .set({ externalId: order.id, updatedAt: new Date() })
        .where(eq(payments.id, payment.id));
    }

    const approve = order.links.find((l) => l.rel === "approve")?.href;
    return NextResponse.json({ id: order.id, approveUrl: approve });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "PayPal is not configured or order failed." },
      { status: 503 },
    );
  }
}
