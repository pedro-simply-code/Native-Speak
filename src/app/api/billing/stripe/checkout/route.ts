import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { CLASS_PACKAGES } from "@/lib/platform/profile-options";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  appBaseUrl,
  isStripeCheckoutSimulated,
  isStripeConfigured,
} from "@/lib/payments/config";
import { completeSimulatedCheckout } from "@/lib/payments/simulate-checkout";
import { getStripe } from "@/lib/payments/stripe";
import { requireDb } from "@/server/db";
import { payments } from "@/server/db/schema";

const bodySchema = z.object({
  packageId: z.string().min(1).max(40),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = await getClientIp();
  const limit = await enforceRateLimit(`${session.user.id}:${ip}`, {
    bucket: "stripe-checkout",
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

  // Never trust a client-supplied price: resolve the package server-side so the
  // amount charged always matches the amount of credit granted.
  const pkg = CLASS_PACKAGES.find((item) => item.id === parsed.data.packageId);
  if (!pkg || pkg.cents <= 0) {
    return NextResponse.json({ error: "Unknown package" }, { status: 400 });
  }

  const simulated = isStripeCheckoutSimulated();
  if (!simulated && !isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 },
    );
  }

  let paymentId: string | undefined;

  try {
    const db = requireDb();
    const [payment] = await db
      .insert(payments)
      .values({
        userId: session.user.id,
        provider: "stripe",
        status: "pending",
        amountCents: pkg.cents,
        currency: "usd",
        metadata: {
          label: pkg.label,
          packageId: pkg.id,
          classes: String(pkg.classes),
        },
      })
      .returning({ id: payments.id });

    if (!payment?.id) {
      return NextResponse.json(
        { error: "Could not create payment" },
        { status: 500 },
      );
    }
    paymentId = payment.id;

    if (simulated) {
      const simulatedResult = await completeSimulatedCheckout(payment.id, "stripe");
      return NextResponse.json({
        url: simulatedResult.redirectUrl,
        simulated: true,
      });
    }

    const stripe = getStripe();
    const origin = appBaseUrl();

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/api/billing/stripe/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/billing?status=canceled&provider=stripe`,
      client_reference_id: payment.id,
      metadata: {
        paymentId: payment.id,
        userId: session.user.id,
        packageId: pkg.id,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: pkg.cents,
            product_data: { name: pkg.label },
          },
        },
      ],
    });

    await db
      .update(payments)
      .set({ externalId: checkout.id, updatedAt: new Date() })
      .where(eq(payments.id, payment.id));

    if (!checkout.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[stripe] checkout failed", error);
    if (paymentId) {
      try {
        await requireDb()
          .update(payments)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(payments.id, paymentId));
      } catch (cleanupError) {
        console.error("[stripe] could not mark payment failed", cleanupError);
      }
    }
    return NextResponse.json(
      { error: "Stripe checkout failed. Check the server logs." },
      { status: 503 },
    );
  }
}
