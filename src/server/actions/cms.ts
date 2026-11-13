"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/permissions";
import {
  contentPlainText,
  parseContentDocument,
} from "@/lib/cms/content";
import { locales } from "@/lib/i18n/config";
import { requireDb } from "@/server/db";
import { cmsContents } from "@/server/db/schema";

const upsertSchema = z.object({
  id: z.string().optional(),
  kind: z.enum(["blog", "page"]),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  locale: z.enum(locales),
  title: z.string().min(2).max(300),
  excerpt: z.string().max(2000).optional(),
  bodyMarkdown: z.string().max(100_000).optional(),
  bodyLexical: z.record(z.string(), z.unknown()).optional().nullable(),
  /** Serialized Lexical `ContentDocument` from Simply-Code-style editor (`name="body"`). */
  body: z.string().max(2_000_000).optional(),
  coverImageUrl: z.string().url().max(2000).optional().or(z.literal("")),
  readMinutes: z.coerce.number().int().min(1).max(120).optional(),
  publish: z.boolean().optional(),
});

export async function upsertCmsContent(input: z.infer<typeof upsertSchema>) {
  const session = await auth();
  const roles = session?.user?.roles ?? [];
  if (!hasPermission(roles, "content.manage")) {
    return { ok: false as const, error: "Forbidden." };
  }

  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid content." };
  }

  const db = requireDb();
  const now = new Date();
  const status = parsed.data.publish ? ("published" as const) : ("draft" as const);

  let bodyLexical = parsed.data.bodyLexical ?? null;
  let bodyMarkdown = parsed.data.bodyMarkdown ?? "";

  if (parsed.data.body) {
    try {
      const doc = parseContentDocument(JSON.parse(parsed.data.body));
      if (doc) {
        bodyLexical = doc as unknown as Record<string, unknown>;
        bodyMarkdown = contentPlainText(doc);
      }
    } catch {
      return { ok: false as const, error: "Invalid editor document." };
    }
  }

  const values = {
    kind: parsed.data.kind,
    slug: parsed.data.slug,
    locale: parsed.data.locale,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt ?? null,
    bodyMarkdown,
    bodyLexical,
    coverImageUrl: parsed.data.coverImageUrl || null,
    readMinutes: parsed.data.readMinutes ?? 5,
    status,
    authorUserId: session!.user!.id,
    publishedAt: parsed.data.publish ? now : null,
    updatedAt: now,
  };

  if (parsed.data.id) {
    await db
      .update(cmsContents)
      .set(values)
      .where(eq(cmsContents.id, parsed.data.id));
    revalidatePath("/blog");
    revalidatePath(`/blog/${parsed.data.slug}`);
    revalidatePath(`/p/${parsed.data.slug}`);
    return { ok: true as const, id: parsed.data.id };
  }

  const [row] = await db.insert(cmsContents).values(values).returning({ id: cmsContents.id });
  revalidatePath("/blog");
  return { ok: true as const, id: row?.id };
}

export async function deleteCmsContent(id: string) {
  const session = await auth();
  if (!hasPermission(session?.user?.roles ?? [], "content.manage")) {
    return { ok: false as const, error: "Forbidden." };
  }
  const db = requireDb();
  await db.delete(cmsContents).where(eq(cmsContents.id, id));
  revalidatePath("/blog");
  return { ok: true as const };
}
