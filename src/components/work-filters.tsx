"use client";

import type { Project } from "@/cms-seed-content/projects";
import { WorkCard } from "@/components/work-card";

export function WorkFilters({ projects }: { projects: Project[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((p) => (
        <WorkCard key={p.slug} project={p} />
      ))}
    </div>
  );
}
