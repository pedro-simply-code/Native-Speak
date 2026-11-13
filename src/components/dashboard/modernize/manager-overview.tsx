"use client";

import Stack from "@mui/material/Stack";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { OverviewChartsPanel } from "@/components/dashboard/modernize/overview-charts-panel";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";
import type { OverviewChartData } from "@/server/queries/overview-analytics";

export function ManagerOverview({
  teachers,
  pendingApps,
  charts,
}: {
  teachers: number;
  pendingApps: number;
  charts: OverviewChartData;
}) {
  const { t } = useDashboardI18n();

  return (
    <Stack spacing={3.5}>
      <DashboardPageHeader
        eyebrow={t("roles.manager")}
        title={t("managerOverview.title")}
        description={t("managerOverview.subtitle")}
      />
      <ManagerStatCards teachers={teachers} pendingApps={pendingApps} t={t} />
      <OverviewChartsPanel data={charts} variant="platform" />
    </Stack>
  );
}

function ManagerStatCards({
  teachers,
  pendingApps,
  t,
}: {
  teachers: number;
  pendingApps: number;
  t: ReturnType<typeof useDashboardI18n>["t"];
}) {
  return (
    <div className="dash-stat-grid">
      <div className="dash-card dash-card--lift dash-stat">
        <p className="dash-stat__label">{t("managerOverview.statTeachers")}</p>
        <p className="dash-stat__value">{teachers}</p>
      </div>
      <div className="dash-card dash-card--lift dash-stat">
        <p className="dash-stat__label">{t("managerOverview.statApplications")}</p>
        <p className="dash-stat__value">{pendingApps}</p>
      </div>
    </div>
  );
}
