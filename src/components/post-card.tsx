import Link from "next/link";
import type { PublicContentSummary } from "@/server/content/queries";

export function PostCard({ post }: { post: PublicContentSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block rounded-lg border p-4">
      <h3 className="font-semibold">{post.title}</h3>
      {post.excerpt ? <p className="mt-1 text-sm text-[var(--theme-muted)]">{post.excerpt}</p> : null}
    </Link>
  );
}
