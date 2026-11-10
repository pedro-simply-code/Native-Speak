import {
  programLevels,
  type ProgramLevelId,
} from "@/lib/marketing/home-content";

/** Launch flow: story → offer → price → partners → resources. */
export const primaryNav = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Pricing", href: "/pricing" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Schools", href: "/schools" },
  { label: "Blog", href: "/blog" },
] as const;

export const programSlugs = [
  "preschool",
  "elementary",
  "middle-school",
  "high-school",
  "adults",
  "schools",
] as const;

export type ProgramSlug = (typeof programSlugs)[number];

export const slugToProgramId: Record<ProgramSlug, ProgramLevelId> = {
  preschool: "preschool",
  elementary: "elementary",
  "middle-school": "middle",
  "high-school": "high",
  adults: "adults",
  schools: "schools",
};

export const programIdToSlug: Record<ProgramLevelId, ProgramSlug> = {
  preschool: "preschool",
  elementary: "elementary",
  middle: "middle-school",
  high: "high-school",
  adults: "adults",
  schools: "schools",
};

export const programMenuLinks = [
  { label: "All programs", href: "/programs" },
  ...programLevels.map((level) => ({
    label: level.label,
    href: `/programs/${programIdToSlug[level.id]}`,
  })),
] as const;
