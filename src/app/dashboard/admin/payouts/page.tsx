import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { AdminPayoutsPanel } from "@/components/dashboard/admin/payouts-panel";
import { listTeacherPayoutsForAdmin } from "@/server/actions/payouts";

async function AdminPayoutsSection() {
  const rows = await listTeacherPayoutsForAdmin();

  return (
    <div className="mt-6">
      <AdminPayoutsPanel rows={rows} />
    </div>
  );
}

export default function AdminPayoutsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Teacher payouts"
        description="Accrued when teachers mark lessons as taught. Mark paid after off-platform transfer."
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading payouts…" />}
      >
        <AdminPayoutsSection />
      </Suspense>
    </>
  );
}
