"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Project } from "@/cms-seed-content/projects";

const ContentEditorProjectsContext = createContext<Project[]>([]);

export function ContentEditorProjectsProvider({
  projects,
  children,
}: {
  projects: Project[];
  children: ReactNode;
}) {
  return (
    <ContentEditorProjectsContext.Provider value={projects}>
      {children}
    </ContentEditorProjectsContext.Provider>
  );
}

/** Published studio projects for work/portfolio blocks in the CMS editor. */
export function useContentEditorProjects(): Project[] {
  return useContext(ContentEditorProjectsContext);
}
