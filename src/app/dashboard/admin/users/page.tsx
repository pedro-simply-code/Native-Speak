import { AdminUserRolesPanel } from "@/components/dashboard/admin/admin-user-roles-panel";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { requireRoles } from "@/lib/auth/guards";
import { getServerLocale } from "@/lib/i18n/locale.server";
import { getMessages } from "@/lib/i18n/messages";
import { listAllAdminUsers } from "@/server/queries/admin-users";

export const instant = false;

export default async function AdminUsersPage() {
  await requireRoles(["admin"]);
  const locale = await getServerLocale();
  const messages = getMessages(locale);
  const initialUsers = await listAllAdminUsers();

  return (
    <>
      <DashboardPageHeader
        title={messages.adminUserRoles.title}
        description={messages.adminUserRoles.description}
      />
      <AdminUserRolesPanel initialUsers={initialUsers} />
    </>
  );
}
