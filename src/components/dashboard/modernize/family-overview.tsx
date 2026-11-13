"use client";

import Link from "next/link";
import Stack from "@mui/material/Stack";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { OverviewChartsPanel } from "@/components/dashboard/modernize/overview-charts-panel";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";
import type { OverviewChartData } from "@/server/queries/overview-analytics";

type Profile = {
  residentialCity: string | null;
  residentialState: string | null;
  learnerType: "self" | "children";
} | null;

export function FamilyOverview({
  profile,
  charts,
}: {
  profile: Profile;
  charts: OverviewChartData;
}) {
  const { t } = useDashboardI18n();

  return (
    <Stack spacing={3.5}>
      <DashboardPageHeader
        eyebrow={t("roles.family")}
        title={t("familyOverview.title")}
        description={t("familyOverview.subtitle")}
      />
      {profile ? (
        <div className="dash-card dash-card--lift space-y-1 p-5 text-sm">
          <p>
            {t("familyOverview.location")}: {profile.residentialCity ?? "—"},{" "}
            {profile.residentialState ?? "—"}
          </p>
          <p>
            {t("familyOverview.learner")}:{" "}
            {profile.learnerType === "children"
              ? t("familyOverview.learnerChildren")
              : t("familyOverview.learnerSelf")}
          </p>
        </div>
      ) : null}

      <OverviewChartsPanel data={charts} variant="family" />

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/billing" className="dash-btn-primary">
          {t("familyOverview.buyClasses")}
        </Link>
        <Link
          href="/dashboard/family/schedule"
          className="rounded-md border px-4 py-2 text-sm font-semibold"
        >
          {t("familyOverview.scheduleClass")}
        </Link>
        <Link
          href="/dashboard/family/classes"
          className="rounded-md border px-4 py-2 text-sm font-semibold"
        >
          {t("familyOverview.myClasses")}
        </Link>
      </div>
    </Stack>
  );
}
