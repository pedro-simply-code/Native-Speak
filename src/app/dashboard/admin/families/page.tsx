import { Suspense } from "react";
import { InviteStaffForm } from "@/components/dashboard/invite-staff-form";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { UsersByRoleTable } from "@/components/dashboard/users-by-role-table";

export default function AdminFamiliesPage() {
  return (
    <>
      <DashboardPageHeader
        eyebrow="Administrator"
        title="Families"
        description="Families usually self-register on the public site. Admins can send invites when needed."
        actions={<InviteStaffForm allowedRoles={["family"]} />}
      />
      <Suspense
        fallback={
          <DashboardLoadingPlaceholder label="Loading families…" />
        }
      >
        <UsersByRoleTable role="family" />
      </Suspense>
    </>
  );
}
