"use client";

import { DashboardLanguageMenu } from "@/components/dashboard/i18n/dashboard-language-menu";
import { MarketingLanguageMenu } from "@/components/i18n/marketing-language-menu";

export function AppLanguageMenu({
  variant = "dashboard",
}: {
  variant?: "dashboard" | "marketing";
}) {
  if (variant === "marketing") return <MarketingLanguageMenu />;
  return <DashboardLanguageMenu />;
}
