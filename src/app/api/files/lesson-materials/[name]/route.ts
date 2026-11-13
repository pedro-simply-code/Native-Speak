import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const UPLOAD_DIR = join(process.cwd(), "storage", "lesson-materials");

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ name: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await ctx.params;
  if (!/^[a-zA-Z0-9_-]+\.[a-z0-9]+$/i.test(name)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const buf = await readFile(join(UPLOAD_DIR, name));
    const ext = name.split(".").pop()?.toLowerCase();
    const type =
      ext === "pdf"
        ? "application/pdf"
        : ext === "png"
          ? "image/png"
          : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : "application/octet-stream";

    return new NextResponse(buf, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
