export type ProjectCategory = string;

export type Project = {
  slug: string;
  image?: string;
  category: ProjectCategory;
  title: string;
  client: string;
  year: string;
  summary: string;
  tags: string[];
  liveUrl?: string;
};

/**
 * Bundled public fallback for projects.
 *
 * Intentionally empty: projects are managed in `/studio` and stored in the
 * database. Add entries here only if you need a static fallback for
 * environments without a database.
 */
export const PROJECTS: Project[] = [];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

export function getAdjacentProjects(slug: string): {
  previous?: Project;
  next?: Project;
} {
  if (PROJECTS.length === 0) return {};

  const index = PROJECTS.findIndex((project) => project.slug === slug);
  if (index === -1) return {};

  return {
    previous: PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length],
    next: PROJECTS[(index + 1) % PROJECTS.length],
  };
}
