/** Supported UI locales. Add a folder under `messages/` and register here. */
export const locales = ["en", "es"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const LOCALE_COOKIE = "ns_locale";

export const localeLabels: Record<
  AppLocale,
  { native: string; flag: string }
> = {
  en: { native: "English", flag: "🇺🇸" },
  es: { native: "Español", flag: "🇪🇸" },
};

export function isAppLocale(value: string | undefined | null): value is AppLocale {
  return locales.includes(value as AppLocale);
}

export function parseAppLocale(value: string | undefined | null): AppLocale {
  return isAppLocale(value) ? value : defaultLocale;
}
