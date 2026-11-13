import { Suspense } from "react";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { listPendingInvitations } from "@/server/actions/invitations";

async function PendingInvitationsTable() {
  const invites = await listPendingInvitations();

  return (
    <div className="dash-card mt-6 overflow-x-auto">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          {invites.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-[var(--dash-muted)]">
                No pending invites.
              </td>
            </tr>
          ) : (
            invites.map((row) => (
              <tr key={row.id}>
                <td>{row.email}</td>
                <td>{row.role}</td>
                <td>{row.expiresAt.toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminInvitationsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Invitations"
        description="Pending staff invites (token URLs are logged in development when sent)."
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading invitations…" />}
      >
        <PendingInvitationsTable />
      </Suspense>
    </>
  );
}
