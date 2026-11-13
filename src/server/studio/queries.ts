import type { Project } from "@/cms-seed-content/projects";

/** Native Speak has no studio projects module; portfolio blocks use seed data. */
export async function getPublicProjectsSafe(): Promise<Project[]> {
  return [];
}
