import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { nanoid } from "nanoid";

const UPLOAD_DIR = join(process.cwd(), "storage", "site-media");
const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function saveSiteMediaFile(file: File) {
  if (!ALLOWED.has(file.type)) {
    throw new Error("UNSUPPORTED_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const id = nanoid(16);
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const fileName = `${id}.${ext}`;
  const path = join(UPLOAD_DIR, fileName);

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path, buffer);

  return {
    storageKey: fileName,
    mimeType: file.type,
    publicUrl: `/api/files/site-media/${fileName}`,
    sizeBytes: file.size,
    fileName: file.name,
  };
}
