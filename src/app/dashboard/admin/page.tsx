import { AdminOverview } from "@/components/dashboard/modernize/admin-overview";
import { getAdminOverviewStats } from "@/server/queries/dashboard";
import { getPlatformOverviewCharts } from "@/server/queries/overview-analytics";

export const instant = false;

export default async function AdminHomePage() {
  const [stats, charts] = await Promise.all([
    getAdminOverviewStats(),
    getPlatformOverviewCharts(),
  ]);
  return <AdminOverview stats={stats} charts={charts} />;
}
