import type { AppRole } from "@/lib/auth/roles";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { listUsersByRole } from "@/server/queries/dashboard";

export async function UsersByRoleTable({ role }: { role: AppRole }) {
  const rows = await listUsersByRole(role);

  return (
    <div className="dash-card mt-6 overflow-x-auto">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-[var(--dash-muted)]">
                No {ROLE_LABELS[role].toLowerCase()} accounts yet.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name ?? "—"}</td>
                <td>{row.email}</td>
                <td>{row.status}</td>
                <td>{row.createdAt.toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
