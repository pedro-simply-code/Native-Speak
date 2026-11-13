"use client";

import { useMemo } from "react";
import { useAppI18n } from "@/components/i18n/app-i18n-provider";
import { getMarketingContent } from "@/lib/i18n/marketing";

export function useMarketingContent() {
  const { locale } = useAppI18n();
  return useMemo(() => getMarketingContent(locale), [locale]);
}
