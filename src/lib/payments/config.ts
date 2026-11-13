import { env } from "@/env.js";

/** Values people leave behind in `.env` that must not count as configured. */
const PLACEHOLDER_VALUE =
  /^(?:\.+|x+|\*+|todo|changeme|placeholder|-+|_+)$/i;

function looksLikeSecret(value: string | undefined, minLength: number) {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.length < minLength) return false;
  if (PLACEHOLDER_VALUE.test(trimmed)) return false;
  // `sk_test_...`, `your_client_secret`, `<paste here>` …
  if (/^(sk|rk|pk)_(test|live)_[.*x]+$/i.test(trimmed)) return false;
  if (/^(your|paste|insert|replace)[-_ ]/i.test(trimmed)) return false;
  if (/[<>{}]/.test(trimmed)) return false;
  return true;
}

export function isStripeConfigured() {
  const key = env.STRIPE_SECRET_KEY?.trim();
  if (!key) return false;
  if (!/^(sk|rk)_(test|live)_/i.test(key)) return false;
  const secret = key.replace(/^(sk|rk)_(test|live)_/i, "");
  // Real Stripe keys carry far more entropy than the `...` placeholder.
  return secret.length >= 20 && /[a-z]/i.test(secret) && /\d/.test(secret);
}

/** Stripe webhook signing secrets have the shape `whsec_` + 32+ characters. */
export function isStripeWebhookConfigured() {
  const secret = env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret || !/^whsec_/i.test(secret)) return false;
  const body = secret.slice("whsec_".length);
  return body.length >= 20 && /[a-z]/i.test(body) && /\d/.test(body);
}

export function isPayPalConfigured() {
  return (
    looksLikeSecret(env.PAYPAL_CLIENT_ID, 10) &&
    looksLikeSecret(env.PAYPAL_CLIENT_SECRET, 10)
  );
}

/** When false, missing keys return HTTP 503 instead of simulating. */
export function allowBillingSimulation() {
  const flag = env.BILLING_SIMULATE;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return env.NODE_ENV !== "production";
}

export function isStripeCheckoutSimulated() {
  return !isStripeConfigured() && allowBillingSimulation();
}

export function isPayPalCheckoutSimulated() {
  return !isPayPalConfigured() && allowBillingSimulation();
}

export function getBillingMode() {
  return {
    stripeSimulated: isStripeCheckoutSimulated(),
    paypalSimulated: isPayPalCheckoutSimulated(),
  };
}

export function appBaseUrl() {
  return (
    env.NEXT_PUBLIC_APP_URL ??
    env.AUTH_URL ??
    "http://localhost:3000"
  );
}
