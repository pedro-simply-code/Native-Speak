import { env } from "@/env.js";
import { appBaseUrl, isPayPalConfigured } from "@/lib/payments/config";

const PAYPAL_API =
  env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken() {
  if (
    !isPayPalConfigured() ||
    !env.PAYPAL_CLIENT_ID ||
    !env.PAYPAL_CLIENT_SECRET
  ) {
    throw new Error(
      "PayPal credentials are missing or still placeholder values.",
    );
  }
  const auth = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`);
  }

  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export async function createPayPalOrder(amountUsd: string, customId: string) {
  const token = await getPayPalAccessToken();
  const base = appBaseUrl();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      application_context: {
        return_url: `${base}/api/billing/paypal/capture?paymentId=${customId}`,
        cancel_url: `${base}/dashboard/billing?cancelled=paypal`,
        user_action: "PAY_NOW",
      },
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amountUsd,
          },
          custom_id: customId,
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PayPal order failed: ${res.status} ${body}`);
  }

  return res.json() as Promise<{ id: string; links: { href: string; rel: string }[] }>;
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PayPal capture failed: ${res.status} ${body}`);
  }
  return res.json() as Promise<{ status: string }>;
}
