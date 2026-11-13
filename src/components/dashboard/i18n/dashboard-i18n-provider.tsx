"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  defaultLocale,
  type AppLocale,
} from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { createTranslator, type TranslateFn } from "@/lib/i18n/translate";
import { setAppLocale } from "@/server/actions/locale";

type Ctx = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  /** Cookie/bootstrap only — no server action, no `router.refresh()`. */
  applyLocaleClient: (locale: AppLocale) => void;
  t: TranslateFn;
};

const DashboardI18nContext = createContext<Ctx | null>(null);

export function DashboardI18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: AppLocale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const [, startTransition] = useTransition();

  const t = useMemo(
    () => createTranslator(getMessages(locale)),
    [locale],
  );

  const applyLocaleClient = useCallback((next: AppLocale) => {
    if (next === locale) return;
    setLocaleState(next);
    document.documentElement.lang = next;
  }, [locale]);

  const setLocale = useCallback(
    (next: AppLocale) => {
      if (next === locale) return;
      startTransition(() => {
        void (async () => {
          await setAppLocale(next);
          applyLocaleClient(next);
          router.refresh();
        })();
      });
    },
    [applyLocaleClient, locale, router],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({ locale, setLocale, applyLocaleClient, t }),
    [locale, setLocale, applyLocaleClient, t],
  );

  return (
    <DashboardI18nContext.Provider value={value}>
      {children}
    </DashboardI18nContext.Provider>
  );
}

export function useDashboardI18n() {
  const ctx = useContext(DashboardI18nContext);
  if (!ctx) {
    const t = createTranslator(getMessages(defaultLocale));
    return {
      locale: defaultLocale,
      setLocale: () => undefined,
      applyLocaleClient: () => undefined,
      t,
    };
  }
  return ctx;
}
