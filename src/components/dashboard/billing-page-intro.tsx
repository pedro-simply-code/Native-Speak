"use client";

import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { useDashboardI18n } from "@/components/dashboard/i18n/dashboard-i18n-provider";

export function BillingPageIntro({
  mode,
}: {
  mode: { stripeSimulated: boolean; paypalSimulated: boolean };
}) {
  const { t } = useDashboardI18n();
  const simulated = mode.stripeSimulated || mode.paypalSimulated;

  return (
    <DashboardPageHeader
      eyebrow={t("billing.eyebrow")}
      title={t("billing.title")}
      description={
        simulated ? t("billing.descriptionSimulated") : t("billing.descriptionLive")
      }
    />
  );
}
