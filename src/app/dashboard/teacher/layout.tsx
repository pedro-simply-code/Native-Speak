import { requireRoles } from "@/lib/auth/guards";

export const instant = false;

export default async function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRoles(["teacher"]);
  return children;
}
