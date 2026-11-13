import { Suspense } from "react";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { TeacherAppointmentsPanel } from "@/components/dashboard/teacher/appointments-panel";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { listTeacherAppointments } from "@/server/actions/teacher";

async function TeacherAppointmentsSection() {
  const [upcoming, past] = await Promise.all([
    listTeacherAppointments(true),
    listTeacherAppointments(false),
  ]);

  return (
    <div className="mt-6">
      <TeacherAppointmentsPanel upcoming={upcoming} past={past} />
    </div>
  );
}

export default function TeacherAppointmentsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Appointments"
        description="Upcoming and past lessons — add notes and mark whether you taught."
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading appointments…" />}
      >
        <TeacherAppointmentsSection />
      </Suspense>
    </>
  );
}
