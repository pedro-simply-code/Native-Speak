import { and, desc, eq } from "drizzle-orm";
import type { AppLocale } from "@/lib/i18n/config";
import { requireDbAtRequest } from "@/server/db";
import { cmsContents } from "@/server/db/schema";

export async function listPublishedBlogPosts(locale: AppLocale = "en") {
  const db = await requireDbAtRequest();
  return db
    .select()
    .from(cmsContents)
    .where(
      and(
        eq(cmsContents.kind, "blog"),
        eq(cmsContents.status, "published"),
        eq(cmsContents.locale, locale),
      ),
    )
    .orderBy(desc(cmsContents.publishedAt));
}

export async function getPublishedBlogPost(slug: string, locale: AppLocale = "en") {
  const db = await requireDbAtRequest();
  const [row] = await db
    .select()
    .from(cmsContents)
    .where(
      and(
        eq(cmsContents.kind, "blog"),
        eq(cmsContents.slug, slug),
        eq(cmsContents.locale, locale),
        eq(cmsContents.status, "published"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getPublishedPage(slug: string, locale: AppLocale = "en") {
  const db = await requireDbAtRequest();
  const [row] = await db
    .select()
    .from(cmsContents)
    .where(
      and(
        eq(cmsContents.kind, "page"),
        eq(cmsContents.slug, slug),
        eq(cmsContents.locale, locale),
        eq(cmsContents.status, "published"),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function listAllCmsForAdmin() {
  const db = await requireDbAtRequest();
  return db
    .select()
    .from(cmsContents)
    .orderBy(desc(cmsContents.updatedAt));
}
