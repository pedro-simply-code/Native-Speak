import { Suspense } from "react";
import { BillingCheckout } from "@/components/dashboard/billing-checkout";
import { RefundsAdminPanel } from "@/components/dashboard/admin/refunds-panel";
import { BillingPaymentSection } from "@/components/dashboard/billing-payment-section";
import { listPaymentRefundsAdmin } from "@/server/actions/refunds";
import { auth } from "@/auth";
import { BillingPageIntro } from "@/components/dashboard/billing-page-intro";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { getBillingMode } from "@/lib/payments/config";

export const instant = false;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const mode = getBillingMode();
  const session = await auth();
  const refunds =
    session?.user?.roles?.includes("admin")
      ? await listPaymentRefundsAdmin()
      : [];

  return (
    <>
      <BillingPageIntro mode={mode} />
      <div className="mt-6">
        <BillingCheckout mode={mode} />
      </div>
      <Suspense
        fallback={
          <DashboardLoadingPlaceholder
            label="Loading payment history…"
            minHeight={160}
          />
        }
      >
        <BillingPaymentSection searchParams={searchParams} />
      </Suspense>
      <RefundsAdminPanel rows={refunds} />
    </>
  );
}
