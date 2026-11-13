import { and, eq } from "drizzle-orm";
import type { AppLocale } from "@/lib/i18n/config";
import { defaultBlocksForPage } from "@/lib/marketing/seed-page-blocks";
import type { MarketingPageKey } from "@/lib/marketing/page-keys";
import { requireDb } from "@/server/db";
import { marketingPageDrafts, type MarketingBlock } from "@/server/db/schema";

export async function getOrCreateMarketingPageDraft(
  pageKey: MarketingPageKey,
  locale: AppLocale,
) {
  const db = requireDb();
  const [existing] = await db
    .select()
    .from(marketingPageDrafts)
    .where(
      and(
        eq(marketingPageDrafts.pageKey, pageKey),
        eq(marketingPageDrafts.locale, locale),
      ),
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  const blocks = defaultBlocksForPage(pageKey, locale);
  const [created] = await db
    .insert(marketingPageDrafts)
    .values({
      pageKey,
      locale,
      blocks,
      updatedAt: new Date(),
    })
    .returning();

  return created!;
}

export type MarketingPageDraftRow = {
  id: string;
  pageKey: string;
  locale: string;
  blocks: MarketingBlock[];
  updatedAt: Date;
};
