import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { TeacherApplicationsQueueSection } from "@/components/dashboard/manager/teacher-applications-queue-section";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";

export const instant = false;

export default function ManagerApplicationsPage() {
  return (
    <>
      <DashboardPageHeader
        eyebrow="Manager"
        title="Teacher applications"
        description="Review submitted documents and approve or reject teacher candidates."
      />
      <Suspense
        fallback={
          <DashboardLoadingPlaceholder label="Loading applications…" />
        }
      >
        <TeacherApplicationsQueueSection />
      </Suspense>
    </>
  );
}
