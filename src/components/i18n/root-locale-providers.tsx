import { AppI18nProvider } from "@/components/i18n/app-i18n-provider";
import { getServerLocale } from "@/lib/i18n/locale.server";

export async function RootLocaleProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  return <AppI18nProvider initialLocale={locale}>{children}</AppI18nProvider>;
}
