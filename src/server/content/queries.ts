import { and, desc, eq } from "drizzle-orm";
import { requireDb } from "@/server/db";
import { cmsContents } from "@/server/db/schema";

export type PublicContentSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  readMinutes: number;
};

export async function listPublishedEntriesSafe(kind: "page" | "post") {
  const dbKind = kind === "post" ? "blog" : "page";
  try {
    const db = requireDb();
    const rows = await db
      .select({
        id: cmsContents.id,
        slug: cmsContents.slug,
        title: cmsContents.title,
        excerpt: cmsContents.excerpt,
        coverImageUrl: cmsContents.coverImageUrl,
        publishedAt: cmsContents.publishedAt,
        readMinutes: cmsContents.readMinutes,
      })
      .from(cmsContents)
      .where(
        and(
          eq(cmsContents.kind, dbKind),
          eq(cmsContents.status, "published"),
        ),
      )
      .orderBy(desc(cmsContents.publishedAt));

    return rows satisfies PublicContentSummary[];
  } catch {
    return [];
  }
}
