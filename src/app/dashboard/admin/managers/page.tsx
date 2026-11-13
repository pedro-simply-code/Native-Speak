import { Suspense } from "react";
import { InviteStaffForm } from "@/components/dashboard/invite-staff-form";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { UsersByRoleTable } from "@/components/dashboard/users-by-role-table";

export default function AdminManagersPage() {
  return (
    <>
      <DashboardPageHeader
        title="Managers"
        description="Invite platform managers. Only admins can create manager accounts."
        actions={<InviteStaffForm allowedRoles={["manager"]} />}
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading managers…" />}
      >
        <UsersByRoleTable role="manager" />
      </Suspense>
    </>
  );
}
