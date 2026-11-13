import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { appBaseUrl, isStripeConfigured } from "@/lib/payments/config";
import { markPaymentSucceeded } from "@/lib/payments/mark-payment-succeeded";
import { getStripe } from "@/lib/payments/stripe";

function billingRedirect(params: Record<string, string>) {
  const url = new URL("/dashboard/billing", appBaseUrl());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

/**
 * Landing point for `success_url`. Verifies the checkout session directly with
 * Stripe, so a payment is recorded even when the webhook is not reachable
 * locally (for example without `stripe listen`). The webhook remains the source
 * of truth in production; `markPaymentSucceeded` is idempotent.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    const login = new URL("/login", appBaseUrl());
    login.searchParams.set("callbackUrl", "/dashboard/billing");
    return NextResponse.redirect(login);
  }

  if (!isStripeConfigured()) {
    return billingRedirect({
      status: "error",
      provider: "stripe",
      error: "not_configured",
    });
  }

  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId) {
    return billingRedirect({
      status: "error",
      provider: "stripe",
      error: "missing_session",
    });
  }

  try {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);

    // Only the buyer may finalize their own checkout, and only a paid session
    // may grant credits.
    if (
      checkout.metadata?.userId !== session.user.id ||
      !checkout.metadata?.paymentId
    ) {
      return billingRedirect({
        status: "error",
        provider: "stripe",
        error: "invalid_session",
      });
    }

    if (checkout.payment_status !== "paid") {
      return billingRedirect({ status: "pending", provider: "stripe" });
    }

    await markPaymentSucceeded(checkout.metadata.paymentId, {
      provider: "stripe",
      externalId: checkout.id,
    });

    return billingRedirect({ status: "success", provider: "stripe" });
  } catch (error) {
    console.error("[stripe] return verification failed", error);
    return billingRedirect({
      status: "error",
      provider: "stripe",
      error: "verification_failed",
    });
  }
}
