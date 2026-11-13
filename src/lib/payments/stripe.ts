import Stripe from "stripe";
import { env } from "@/env.js";
import { isStripeConfigured } from "@/lib/payments/config";

export function getStripe() {
  if (!isStripeConfigured() || !env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is missing or still a placeholder value.",
    );
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}
