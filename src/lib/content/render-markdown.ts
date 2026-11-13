/** Minimal markdown-ish render for CMS bodies (paragraphs + ## headings). */
export function markdownToElements(body: string): { kind: "h2" | "p"; text: string }[] {
  const chunks = body.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
  return chunks.map((chunk) => {
    if (chunk.startsWith("## ")) {
      return { kind: "h2" as const, text: chunk.slice(3).trim() };
    }
    return { kind: "p" as const, text: chunk.replace(/\n/g, " ") };
  });
}
