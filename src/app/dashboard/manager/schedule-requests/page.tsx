import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { ScheduleRequestsQueueSection } from "@/components/dashboard/manager/schedule-requests-queue-section";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";

export const instant = false;

export default function ScheduleRequestsPage() {
  return (
    <>
      <DashboardPageHeader
        eyebrow="Manager"
        title="Schedule change requests"
        description="Review family or teacher cancel and reschedule requests that need a valid reason or fall outside policy."
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading requests…" />}
      >
        <ScheduleRequestsQueueSection />
      </Suspense>
    </>
  );
}
