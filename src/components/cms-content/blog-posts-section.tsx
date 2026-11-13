import type { ReactNode } from "react";
import { BlogPostsListing } from "@/components/cms-content/blog-posts-listing";
import type { BlogSectionData } from "@/lib/cms/site-page-sections";
import { cn } from "@/lib/utils";
import type { PublicContentSummary } from "@/server/content/queries";

export function BlogPostsSection({
  data,
  posts,
  className,
  emptyMessageOverride,
}: {
  data: BlogSectionData;
  posts: PublicContentSummary[];
  className?: string;
  emptyMessageOverride?: ReactNode;
}) {
  return (
    <section
      id="blog-posts"
      className={cn(
        "mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6",
        className,
      )}
    >
      <div>
        <BlogPostsListing
          data={data}
          posts={posts}
          emptyMessageOverride={emptyMessageOverride}
        />
      </div>
    </section>
  );
}
