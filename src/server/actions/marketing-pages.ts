"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { locales } from "@/lib/i18n/config";
import { MARKETING_PAGE_KEYS } from "@/lib/marketing/page-keys";
import { defaultBlocksForPage } from "@/lib/marketing/seed-page-blocks";
import { requireDb } from "@/server/db";
import {
  marketingPageDrafts,
  type MarketingBlock,
} from "@/server/db/schema";
import { getOrCreateMarketingPageDraft } from "@/server/queries/marketing-pages";

const pageKeySchema = z.enum(MARKETING_PAGE_KEYS);
const localeSchema = z.enum(locales);

const blocksSchema = z.custom<MarketingBlock[]>(
  (val) => Array.isArray(val),
  "Invalid blocks",
);

export async function loadMarketingPageDraft(
  pageKey: z.infer<typeof pageKeySchema>,
  locale: z.infer<typeof localeSchema>,
) {
  const session = await auth();
  if (!hasPermission(session?.user?.roles ?? [], "content.manage")) {
    return { ok: false as const, error: "Forbidden." };
  }

  const key = pageKeySchema.safeParse(pageKey);
  const loc = localeSchema.safeParse(locale);
  if (!key.success || !loc.success) {
    return { ok: false as const, error: "Invalid page or locale." };
  }

  const row = await getOrCreateMarketingPageDraft(key.data, loc.data);
  return { ok: true as const, draft: row };
}

export async function saveMarketingPageBlocks(input: {
  pageKey: z.infer<typeof pageKeySchema>;
  locale: z.infer<typeof localeSchema>;
  blocks: MarketingBlock[];
}) {
  const session = await auth();
  if (!hasPermission(session?.user?.roles ?? [], "content.manage")) {
    return { ok: false as const, error: "Forbidden." };
  }

  const key = pageKeySchema.safeParse(input.pageKey);
  const loc = localeSchema.safeParse(input.locale);
  const blocks = blocksSchema.safeParse(input.blocks);
  if (!key.success || !loc.success || !blocks.success) {
    return { ok: false as const, error: "Invalid payload." };
  }

  const db = requireDb();
  const now = new Date();
  await db
    .insert(marketingPageDrafts)
    .values({
      pageKey: key.data,
      locale: loc.data,
      blocks: blocks.data,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [marketingPageDrafts.pageKey, marketingPageDrafts.locale],
      set: { blocks: blocks.data, updatedAt: now },
    });

  revalidatePath("/dashboard/admin/content");
  return { ok: true as const };
}

export async function resetMarketingPageDraft(input: {
  pageKey: z.infer<typeof pageKeySchema>;
  locale: z.infer<typeof localeSchema>;
}) {
  const session = await auth();
  if (!hasPermission(session?.user?.roles ?? [], "content.manage")) {
    return { ok: false as const, error: "Forbidden." };
  }

  const key = pageKeySchema.safeParse(input.pageKey);
  const loc = localeSchema.safeParse(input.locale);
  if (!key.success || !loc.success) {
    return { ok: false as const, error: "Invalid page or locale." };
  }

  const blocks = defaultBlocksForPage(key.data, loc.data);
  const db = requireDb();
  const now = new Date();

  await db
    .insert(marketingPageDrafts)
    .values({
      pageKey: key.data,
      locale: loc.data,
      blocks,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [marketingPageDrafts.pageKey, marketingPageDrafts.locale],
      set: { blocks, updatedAt: now },
    });

  revalidatePath("/dashboard/admin/content");
  return { ok: true as const, blocks };
}
