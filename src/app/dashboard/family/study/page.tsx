import { Suspense } from "react";
import Link from "next/link";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { listStudyWorkbooksForFamily } from "@/server/actions/study-workbooks";

async function FamilyStudyList() {
  const workbooks = await listStudyWorkbooksForFamily();

  return (
    <ul className="mt-6 space-y-3">
      {workbooks.length === 0 ? (
        <li className="dash-card p-5 text-sm text-[var(--dash-muted)]">
          No study workbooks yet. Your teacher will publish materials after class.
        </li>
      ) : (
        workbooks.map((wb) => (
          <li key={wb.id} className="dash-card p-4 text-sm">
            <Link
              href={`/dashboard/family/study/${wb.id}`}
              className="font-semibold text-[var(--dash-primary)]"
            >
              {wb.title}
            </Link>
            {wb.description ? (
              <p className="mt-1 text-[var(--dash-muted)]">{wb.description}</p>
            ) : null}
          </li>
        ))
      )}
    </ul>
  );
}

export default function FamilyStudyListPage() {
  return (
    <>
      <DashboardPageHeader
        title="Study journal"
        description="Review your teacher’s materials, write what you learned, and mark practice complete."
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading study journal…" />}
      >
        <FamilyStudyList />
      </Suspense>
    </>
  );
}
