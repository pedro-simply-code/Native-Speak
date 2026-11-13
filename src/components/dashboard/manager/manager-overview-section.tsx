import { ManagerOverview } from "@/components/dashboard/modernize/manager-overview";
import {
  countTeacherApplicationsPending,
  countUsersWithRole,
} from "@/server/queries/dashboard";
import { getPlatformOverviewCharts } from "@/server/queries/overview-analytics";

export async function ManagerOverviewSection() {
  const [teachers, pendingApps, charts] = await Promise.all([
    countUsersWithRole("teacher"),
    countTeacherApplicationsPending(),
    getPlatformOverviewCharts(),
  ]);

  return (
    <ManagerOverview
      teachers={teachers}
      pendingApps={pendingApps}
      charts={charts}
    />
  );
}
