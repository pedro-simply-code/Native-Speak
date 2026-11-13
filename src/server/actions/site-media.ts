"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/auth/permissions";
import type { AppRole } from "@/lib/auth/roles";
import { saveSiteMediaFile } from "@/lib/storage/site-media";
import { requireDb } from "@/server/db";
import { siteMedia } from "@/server/db/schema";

function assertContentManager(roles: AppRole[]) {
  if (!hasPermission(roles, "content.manage")) {
    return { ok: false as const, error: "Forbidden." };
  }
  return null;
}

const registerSchema = z.object({
  url: z.string().url(),
  storageKey: z.string().min(1).max(500),
  fileName: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().nonnegative(),
  uploadedByUserId: z.string().optional(),
});

export async function registerSiteMediaFromUpload(
  input: z.infer<typeof registerSchema>,
) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid media metadata." };
  }

  const db = requireDb();
  const [row] = await db
    .insert(siteMedia)
    .values({
      url: parsed.data.url,
      storageKey: parsed.data.storageKey,
      fileName: parsed.data.fileName,
      mimeType: parsed.data.mimeType,
      sizeBytes: parsed.data.sizeBytes,
      uploadedByUserId: parsed.data.uploadedByUserId ?? null,
    })
    .returning({ id: siteMedia.id });

  revalidatePath("/dashboard/admin/content");
  return { ok: true as const, id: row?.id };
}

export async function uploadSiteMediaLocal(formData: FormData) {
  const session = await auth();
  const roles = (session?.user?.roles ?? []) as AppRole[];
  const forbidden = assertContentManager(roles);
  if (forbidden) return forbidden;

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, error: "No file provided." };
  }

  try {
    const saved = await saveSiteMediaFile(file);
    const db = requireDb();
    const [row] = await db
      .insert(siteMedia)
      .values({
        url: saved.publicUrl,
        storageKey: saved.storageKey,
        fileName: saved.fileName,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
        uploadedByUserId: session!.user!.id,
      })
      .returning();
    revalidatePath("/dashboard/admin/content");
    return { ok: true as const, media: row };
  } catch (err) {
    const code = err instanceof Error ? err.message : "UPLOAD_FAILED";
    if (code === "UNSUPPORTED_TYPE") {
      return { ok: false as const, error: "Unsupported file type." };
    }
    if (code === "FILE_TOO_LARGE") {
      return { ok: false as const, error: "File is too large (max 12MB)." };
    }
    return { ok: false as const, error: "Upload failed." };
  }
}

export async function updateSiteMediaAlt(id: string, altText: string) {
  const session = await auth();
  const forbidden = assertContentManager(
    (session?.user?.roles ?? []) as AppRole[],
  );
  if (forbidden) return forbidden;

  const db = requireDb();
  await db
    .update(siteMedia)
    .set({ altText: altText.slice(0, 500) || null })
    .where(eq(siteMedia.id, id));
  revalidatePath("/dashboard/admin/content");
  return { ok: true as const };
}

export async function deleteSiteMedia(id: string) {
  const session = await auth();
  const forbidden = assertContentManager(
    (session?.user?.roles ?? []) as AppRole[],
  );
  if (forbidden) return forbidden;

  const db = requireDb();
  await db.delete(siteMedia).where(eq(siteMedia.id, id));
  revalidatePath("/dashboard/admin/content");
  return { ok: true as const };
}

export async function listSiteMediaAction() {
  const session = await auth();
  const forbidden = assertContentManager(
    (session?.user?.roles ?? []) as AppRole[],
  );
  if (forbidden) return forbidden;

  const db = requireDb();
  const rows = await db
    .select()
    .from(siteMedia)
    .orderBy(siteMedia.createdAt);
  return { ok: true as const, rows };
}
