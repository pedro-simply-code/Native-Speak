import { Suspense } from "react";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { listAssignedStudents } from "@/server/actions/teacher";

async function AssignedStudentsTable() {
  const rows = await listAssignedStudents();

  return (
    <div className="dash-card mt-6 overflow-x-auto">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Age</th>
            <th>Grade</th>
            <th>Proficiency</th>
            <th>Family contact</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-[var(--dash-muted)]">
                Students appear when families schedule classes with you.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.studentId}>
                <td>
                  {r.firstName} {r.lastName}
                </td>
                <td>{r.age ?? "—"}</td>
                <td>{r.grade ?? "—"}</td>
                <td>{r.proficiency}</td>
                <td>{r.familyEmail}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function TeacherStudentsPage() {
  return (
    <>
      <DashboardPageHeader title="Assigned students" />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading students…" />}
      >
        <AssignedStudentsTable />
      </Suspense>
    </>
  );
}
