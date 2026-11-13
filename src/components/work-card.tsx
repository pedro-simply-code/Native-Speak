import type { Project } from "@/cms-seed-content/projects";

export function WorkCard({ project }: { project: Project }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="font-semibold">{project.title}</p>
    </div>
  );
}
