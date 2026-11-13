import { NextResponse } from "next/server";
import { env } from "@/env.js";
import {
  isStripeConfigured,
  isStripeWebhookConfigured,
} from "@/lib/payments/config";
import { markPaymentSucceeded } from "@/lib/payments/mark-payment-succeeded";
import { getStripe } from "@/lib/payments/stripe";
import { requireDb } from "@/server/db";

export async function POST(req: Request) {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !webhookSecret || !isStripeWebhookConfigured()) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // `checkout.session.completed` is enough for cards. Delayed payment methods
  // finish later via `checkout.session.async_payment_succeeded`.
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    const paymentId = session.metadata?.paymentId;
    if (paymentId && session.payment_status === "paid") {
      requireDb();
      await markPaymentSucceeded(paymentId, {
        provider: "stripe",
        externalId: session.id,
      });
    }
  }

  return NextResponse.json({ received: true });
}
