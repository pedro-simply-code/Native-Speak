import { requireRoles } from "@/lib/auth/guards";

export const instant = false;

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRoles(["admin"]);
  return children;
}
