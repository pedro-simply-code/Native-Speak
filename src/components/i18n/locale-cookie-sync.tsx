"use client";

import { useEffect, useRef } from "react";
import {
  LOCALE_COOKIE,
  isAppLocale,
  type AppLocale,
} from "@/lib/i18n/config";
import { useAppI18n } from "@/components/i18n/app-i18n-provider";

/** Applies `ns_locale` cookie on the client without revalidating the root layout. */
export function LocaleCookieSync() {
  const { locale, applyLocaleClient } = useAppI18n();
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;
    try {
      const parts = document.cookie ? document.cookie.split("; ") : [];
      for (const part of parts) {
        const prefix = `${LOCALE_COOKIE}=`;
        if (!part.startsWith(prefix)) continue;
        const raw = decodeURIComponent(part.slice(prefix.length)) as AppLocale;
        if (isAppLocale(raw) && raw !== locale) {
          applyLocaleClient(raw);
        }
        return;
      }
    } catch {
      /* noop */
    }
  }, [applyLocaleClient, locale]);

  return null;
}
