import { getServerLocale } from "@/lib/i18n/locale.server";
import { getMarketingContent, type MarketingContent } from "@/lib/i18n/marketing";

export async function getMarketingContentForRequest(): Promise<MarketingContent> {
  const locale = await getServerLocale();
  return getMarketingContent(locale);
}
