import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";

const UPLOAD_DIR = join(process.cwd(), "storage", "site-media");

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  try {
    const data = await readFile(join(UPLOAD_DIR, name));
    const ext = name.split(".").pop()?.toLowerCase() ?? "bin";
    const type = MIME[ext] ?? "application/octet-stream";
    return new NextResponse(data, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
