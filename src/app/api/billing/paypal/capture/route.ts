import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { capturePayPalOrder } from "@/lib/payments/paypal";
import { markPaymentSucceeded } from "@/lib/payments/mark-payment-succeeded";
import { requireDb } from "@/server/db";
import { payments } from "@/server/db/schema";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const url = new URL(req.url);
  const paymentId = url.searchParams.get("paymentId");
  const orderId =
    url.searchParams.get("token") ?? url.searchParams.get("orderId");

  if (!paymentId || !orderId) {
    return NextResponse.redirect(
      new URL("/dashboard/billing?error=paypal-missing", req.url),
    );
  }

  const db = requireDb();
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!payment || payment.userId !== session.user.id) {
    return NextResponse.redirect(
      new URL("/dashboard/billing?error=paypal-forbidden", req.url),
    );
  }

  try {
    const result = await capturePayPalOrder(orderId);
    const succeeded = result.status === "COMPLETED";
    if (succeeded) {
      await markPaymentSucceeded(paymentId, {
        provider: "paypal",
        externalId: orderId,
      });
    } else {
      await db
        .update(payments)
        .set({ status: "failed", externalId: orderId, updatedAt: new Date() })
        .where(eq(payments.id, paymentId));
    }

    return NextResponse.redirect(
      new URL(
        `/dashboard/billing?${succeeded ? "success=paypal" : "error=paypal-status"}`,
        req.url,
      ),
    );
  } catch (error) {
    console.error(error);
    await db
      .update(payments)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(payments.id, paymentId));
    return NextResponse.redirect(
      new URL("/dashboard/billing?error=paypal-capture", req.url),
    );
  }
}
