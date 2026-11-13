"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicContentSummary } from "@/server/content/queries";

const ContentEditorPostsContext = createContext<PublicContentSummary[]>([]);

export function ContentEditorPostsProvider({
  posts,
  children,
}: {
  posts: PublicContentSummary[];
  children: ReactNode;
}) {
  return (
    <ContentEditorPostsContext.Provider value={posts}>
      {children}
    </ContentEditorPostsContext.Provider>
  );
}

/** Published blog posts for the blog section block in the CMS editor. */
export function useContentEditorPosts(): PublicContentSummary[] {
  return useContext(ContentEditorPostsContext);
}
