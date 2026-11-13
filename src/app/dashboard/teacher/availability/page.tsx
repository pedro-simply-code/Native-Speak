import { Suspense } from "react";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { TeacherAvailabilityForm } from "@/components/dashboard/teacher/availability-form";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import {
  listCalendarBlocks,
  listWeeklyAvailability,
} from "@/server/actions/teacher";

async function TeacherAvailabilitySection() {
  const [weekly, blocks] = await Promise.all([
    listWeeklyAvailability(),
    listCalendarBlocks(),
  ]);

  return (
    <div className="mt-6">
      <TeacherAvailabilityForm initialWeekly={weekly} initialBlocks={blocks} />
    </div>
  );
}

export default function TeacherAvailabilityPage() {
  return (
    <>
      <DashboardPageHeader
        title="Availability"
        description="Set weekly hours and block days you cannot teach."
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading availability…" />}
      >
        <TeacherAvailabilitySection />
      </Suspense>
    </>
  );
}
