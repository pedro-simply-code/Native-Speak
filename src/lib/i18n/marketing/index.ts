import type { AppLocale } from "@/lib/i18n/config";
import {
  buildMarketingEn,
  type MarketingContent,
} from "@/lib/i18n/marketing/build-en";
import { marketingEs } from "@/lib/i18n/marketing/es";
import { blogPosts } from "@/lib/marketing/pages-content";
import { howItWorksFaq, pricingTestimonialsSection } from "@/lib/marketing/how-it-works-content";

let enCache: MarketingContent | null = null;

function buildMarketingEnCached(): MarketingContent {
  enCache ??= buildMarketingEn();
  return enCache;
}

const esWithFallbacks: MarketingContent = {
  ...marketingEs,
  blogPosts:
    marketingEs.blogPosts.length > 0
      ? marketingEs.blogPosts
      : [...blogPosts],
  howItWorksFaq:
    marketingEs.howItWorksFaq.length > 0
      ? marketingEs.howItWorksFaq
      : [...howItWorksFaq],
  pricingTestimonialsSection:
    marketingEs.pricingTestimonialsSection ?? pricingTestimonialsSection,
};

export function getMarketingContent(locale: AppLocale): MarketingContent {
  return locale === "es" ? esWithFallbacks : buildMarketingEnCached();
}

export type { MarketingContent };
