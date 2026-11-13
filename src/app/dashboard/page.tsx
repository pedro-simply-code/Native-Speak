import { redirect } from "next/navigation";
import type { AppRole } from "@/lib/auth/roles";
import { ROLE_HOME } from "@/lib/auth/roles";
import { requireSession } from "@/lib/auth/guards";

export const instant = false;

export default async function DashboardIndexPage() {
  const session = await requireSession("/dashboard");
  const roles = session.user.roles ?? [];
  if (roles.length === 0) {
    redirect("/dashboard/pending-role");
  }
  const home = session.user.primaryRole
    ? ROLE_HOME[session.user.primaryRole as AppRole]
    : ROLE_HOME[roles[0] as AppRole];
  redirect(home);
}
