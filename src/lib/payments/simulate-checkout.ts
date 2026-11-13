import { nanoid } from "nanoid";
import { appBaseUrl } from "@/lib/payments/config";
import { markPaymentSucceeded } from "@/lib/payments/mark-payment-succeeded";

export async function completeSimulatedCheckout(
  paymentId: string,
  provider: "stripe" | "paypal",
) {
  const externalId = `sim_${provider}_${nanoid(12)}`;
  await markPaymentSucceeded(paymentId, {
    provider,
    externalId,
    simulated: true,
  });

  const base = appBaseUrl();
  const redirectUrl = `${base}/dashboard/billing?status=success&provider=${provider}&simulated=1`;
  return { redirectUrl, simulated: true as const };
}
