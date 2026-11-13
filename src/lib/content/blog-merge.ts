import type { AppLocale } from "@/lib/i18n/config";
import { blogPosts } from "@/lib/marketing/pages-content";
import { listPublishedBlogPosts } from "@/server/queries/cms";

export type PublicBlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  image: string;
  imageAlt: string;
  body: string;
  source: "cms" | "static";
};

const FALLBACK_IMAGE = blogPosts[0]?.image ?? "/marketing/hero.jpg";

export async function getPublicBlogPosts(locale: AppLocale = "en") {
  let cms: Awaited<ReturnType<typeof listPublishedBlogPosts>> = [];
  try {
    cms = await listPublishedBlogPosts(locale);
  } catch {
    cms = [];
  }

  const fromDb: PublicBlogPost[] = cms.map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    date: row.publishedAt
      ? row.publishedAt.toLocaleDateString(locale === "es" ? "es" : "en", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "",
    readMinutes: row.readMinutes,
    image: row.coverImageUrl ?? FALLBACK_IMAGE,
    imageAlt: row.title,
    body: row.bodyMarkdown,
    source: "cms",
  }));

  const cmsSlugs = new Set(fromDb.map((p) => p.slug));
  const fromStatic: PublicBlogPost[] = blogPosts
    .filter((p) => !cmsSlugs.has(p.slug))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      readMinutes: p.readMinutes,
      image: p.image,
      imageAlt: p.imageAlt,
      body: p.body.join("\n\n"),
      source: "static" as const,
    }));

  return [...fromDb, ...fromStatic];
}

export async function getPublicBlogPost(slug: string, locale: AppLocale = "en") {
  const posts = await getPublicBlogPosts(locale);
  return posts.find((p) => p.slug === slug) ?? null;
}
