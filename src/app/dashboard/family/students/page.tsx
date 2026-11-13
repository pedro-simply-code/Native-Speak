import { Suspense } from "react";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { StudentsPanel } from "@/components/dashboard/family/students-panel";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { listFamilyStudents } from "@/server/actions/family";

async function FamilyStudentsSection() {
  const students = await listFamilyStudents();

  return (
    <div className="mt-6">
      <StudentsPanel initial={students} />
    </div>
  );
}

export default function FamilyStudentsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Students"
        description="Learner profiles for scheduling and progress."
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading students…" />}
      >
        <FamilyStudentsSection />
      </Suspense>
    </>
  );
}
