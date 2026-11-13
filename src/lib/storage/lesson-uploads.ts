import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { nanoid } from "nanoid";

const UPLOAD_DIR = join(process.cwd(), "storage", "lesson-materials");
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function saveLessonMaterialFile(file: File) {
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
    storagePath: fileName,
    mimeType: file.type,
    publicUrl: `/api/files/lesson-materials/${fileName}`,
  };
}
