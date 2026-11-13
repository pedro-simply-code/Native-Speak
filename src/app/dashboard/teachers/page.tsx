import { Suspense } from "react";
import { InviteStaffForm } from "@/components/dashboard/invite-staff-form";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { UsersByRoleTable } from "@/components/dashboard/users-by-role-table";
import { requireRoles } from "@/lib/auth/guards";

export const instant = false;

export default async function TeachersStaffPage() {
  await requireRoles(["admin", "manager"], "/dashboard/teachers");

  return (
    <>
      <DashboardPageHeader
        eyebrow="Staff"
        title="Teachers"
        description="Invite teachers directly or wait for self-service applications reviewed by managers."
        actions={<InviteStaffForm allowedRoles={["teacher"]} />}
      />
      <Suspense
        fallback={
          <DashboardLoadingPlaceholder label="Loading teachers…" />
        }
      >
        <UsersByRoleTable role="teacher" />
      </Suspense>
    </>
  );
}
