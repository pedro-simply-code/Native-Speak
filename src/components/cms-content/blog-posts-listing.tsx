"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { ListingPagination } from "@/components/listing-pagination";
import { PostCard } from "@/components/post-card";
import type { BlogSectionData } from "@/lib/cms/site-page-sections";
import { appEmptyState, siteStagger } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";
import type { PublicContentSummary } from "@/server/content/queries";

export function BlogPostsListing({
  data,
  posts,
  emptyMessageOverride,
}: {
  data: BlogSectionData;
  posts: PublicContentSummary[];
  emptyMessageOverride?: ReactNode;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  const pageSize = data.pageSize;
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize) || 1);
  const displayPage = Math.min(page, totalPages);

  const pagePosts = useMemo(() => {
    const start = (displayPage - 1) * pageSize;
    return posts.slice(start, start + pageSize);
  }, [posts, pageSize, displayPage]);

  const goToPage = (next: number) => {
    const clamped = Math.max(1, Math.min(totalPages, next));
    setPage(clamped);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (posts.length === 0) {
    return (
      <p
        className={cn(
          appEmptyState,
          "bg-white/60 px-6 py-16 text-center text-[15px] text-[#57524a]",
        )}
      >
        {emptyMessageOverride ?? data.emptyMessage}
      </p>
    );
  }

  return (
    <div ref={sectionRef}>
      <div className="mb-8 flex flex-wrap items-center justify-end gap-2">
        <span className="text-[12px] text-[#6f6a60]">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </span>
      </div>

      <div
        className={cn(
          siteStagger,
          "grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3",
        )}
        aria-live="polite"
      >
        {pagePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <ListingPagination
        page={displayPage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
}
