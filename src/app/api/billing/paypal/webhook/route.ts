import { NextResponse } from "next/server";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { markPaymentSucceeded } from "@/lib/payments/mark-payment-succeeded";
import { requireDb } from "@/server/db";

type PayPalWebhookEvent = {
  event_type?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    supplementary_data?: { related_ids?: { order_id?: string } };
  };
};

export async function POST(req: Request) {
  const ip = await getClientIp();
  const limit = await enforceRateLimit(ip, {
    bucket: "paypal-webhook",
    limit: 200,
    windowMs: 60 * 1000,
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }

  let event: PayPalWebhookEvent;
  try {
    event = (await req.json()) as PayPalWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paymentId =
    event.resource?.custom_id ??
    event.resource?.supplementary_data?.related_ids?.order_id;

  if (
    paymentId &&
  (event.event_type === "PAYMENT.CAPTURE.COMPLETED" ||
      event.event_type === "CHECKOUT.ORDER.APPROVED")
  ) {
    requireDb();
    await markPaymentSucceeded(paymentId, {
      provider: "paypal",
      externalId: event.resource?.id,
    });
  }

  return NextResponse.json({ received: true });
}
