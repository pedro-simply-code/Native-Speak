import { requireRoles } from "@/lib/auth/guards";

/** Manager routes use auth() + DB on the server — not compatible with instant nav. */
export const instant = false;

export default async function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRoles(["admin", "manager"]);
  return children;
}
