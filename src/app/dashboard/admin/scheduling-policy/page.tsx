import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { SchedulingPolicyForm } from "@/components/dashboard/admin/scheduling-policy-form";
import { getSchedulingPolicyAdmin } from "@/server/actions/scheduling-policy-admin";

async function SchedulingPolicySection() {
  const policy = await getSchedulingPolicyAdmin();

  return (
    <div className="mt-6">
      {policy ? (
        <SchedulingPolicyForm initial={policy} />
      ) : (
        <p className="text-sm text-[var(--dash-muted)]">
          Run db:migrate to seed the default policy.
        </p>
      )}
    </div>
  );
}

export default function AdminSchedulingPolicyPage() {
  return (
    <>
      <DashboardPageHeader
        title="Scheduling policy"
        description="Cancel/reschedule windows, credit penalties, and monthly free reschedules."
      />
      <Suspense
        fallback={
          <DashboardLoadingPlaceholder label="Loading scheduling policy…" />
        }
      >
        <SchedulingPolicySection />
      </Suspense>
    </>
  );
}
