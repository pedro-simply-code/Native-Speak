import { requireRoles } from "@/lib/auth/guards";

export const instant = false;

export default async function FamilyDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRoles(["family"]);
  return children;
}
