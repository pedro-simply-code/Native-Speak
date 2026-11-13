"use client";

import Link from "next/link";
import Stack from "@mui/material/Stack";
import { TeacherApplicationUploadForm } from "@/components/dashboard/teacher/application-upload-form";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { OverviewChartsPanel } from "@/components/dashboard/modernize/overview-charts-panel";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";
import type { OverviewChartData } from "@/server/queries/overview-analytics";

type Profile = {
  status: string;
  timezone: string;
  nativeLanguage: string;
  secondaryLanguages: string[] | null;
} | null;

export function TeacherOverview({
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
        eyebrow={t("roles.teacher")}
        title={t("teacherOverview.title")}
        description={t("teacherOverview.subtitle")}
        actions={<TeacherApplicationUploadForm />}
      />
      {profile ? (
        <div className="dash-card dash-card--lift space-y-2 p-5 text-sm">
          <p>
            <span className="font-semibold">{t("teacherOverview.status")}:</span>{" "}
            {profile.status}
          </p>
          <p>
            <span className="font-semibold">{t("teacherOverview.timezone")}:</span>{" "}
            {profile.timezone}
          </p>
          <p>
            <span className="font-semibold">{t("teacherOverview.languages")}:</span>{" "}
            {profile.nativeLanguage}
            {profile.secondaryLanguages?.length
              ? ` · ${profile.secondaryLanguages.join(", ")}`
              : ""}
          </p>
        </div>
      ) : (
        <p className="dash-card p-5 text-sm text-[var(--dash-muted)]">
          {t("teacherOverview.completeProfile")}
        </p>
      )}

      <OverviewChartsPanel data={charts} variant="teacher" />

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/teacher/availability" className="dash-btn-primary">
          {t("teacherOverview.manageAvailability")}
        </Link>
        <Link
          href="/dashboard/teacher/appointments"
          className="rounded-md border px-4 py-2 text-sm font-semibold"
        >
          {t("teacherOverview.appointments")}
        </Link>
      </div>
    </Stack>
  );
}
