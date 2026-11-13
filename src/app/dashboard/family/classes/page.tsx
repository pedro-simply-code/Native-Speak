import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { FamilyClassesPanel } from "@/components/dashboard/family/family-classes-panel";
import {
  getFamilyCreditsSummary,
  listFamilyAppointmentsDetailed,
} from "@/server/actions/appointment-changes";

async function FamilyClassesSection() {
  const [upcoming, past, credits] = await Promise.all([
    listFamilyAppointmentsDetailed(true),
    listFamilyAppointmentsDetailed(false),
    getFamilyCreditsSummary(),
  ]);

  return (
    <div className="mt-6">
      <FamilyClassesPanel
        upcoming={upcoming.filter((c) => c.status === "scheduled")}
        past={past}
        creditBalance={credits.balance}
      />
    </div>
  );
}

export default function FamilyClassesPage() {
  return (
    <>
      <DashboardPageHeader
        title="My classes"
        description="Cancel or reschedule with policy-based fees. Emergency reasons may require manager approval."
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading classes…" />}
      >
        <FamilyClassesSection />
      </Suspense>
    </>
  );
}
