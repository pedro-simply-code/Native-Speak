import { Suspense } from "react";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { StudyBuilderPanel } from "@/components/dashboard/teacher/study-builder-panel";
import { listStudyWorkbooksForTeacher } from "@/server/actions/study-workbooks";
import { listFamilyAccountsForStaff } from "@/server/queries/families-picker";

async function StudyBuilderSection() {
  const [workbooks, families] = await Promise.all([
    listStudyWorkbooksForTeacher(),
    listFamilyAccountsForStaff(),
  ]);

  if (families.length === 0) {
    return (
      <p className="dash-card mt-6 p-5 text-sm text-[var(--dash-muted)]">
        No family accounts yet — invite families before assigning workbooks.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <StudyBuilderPanel initial={workbooks} families={families} />
    </div>
  );
}

export default function TeacherStudyBuilderPage() {
  return (
    <>
      <DashboardPageHeader
        title="Study materials"
        description="Build lesson notes, practice exercises, and resource links for each family. Students track progress in their study journal."
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading study materials…" />}
      >
        <StudyBuilderSection />
      </Suspense>
    </>
  );
}
