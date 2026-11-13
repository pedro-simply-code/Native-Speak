export type TeamMember = {
  /** Set when loaded from the studio team (users table). */
  id?: string;
  name: string;
  role: string;
  skills: string[];
  image?: string | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
};

export const TEAM_DESIGN = ["UX Design", "Figma", "Prototyping"];

export const TEAM_TECH = [
  "AI Dev",
  "TSX",
  "CSS",
  "React.js",
  "Next.js",
  "PostgreSQL",
  "WordPress",
  "Bootstrap",
  "ACF",
  "Visual Composer",
  "WPML",
];

export const TEAM: TeamMember[] = [
  {
    name: "Ryan",
    role: "Founder · UX & Developer",
    skills: [...TEAM_DESIGN, ...TEAM_TECH],
  },
  {
    name: "Gudiel",
    role: "Project Lead · Full Stack",
    skills: TEAM_TECH,
  },
  {
    name: "Pedro",
    role: "Full Stack Developer",
    skills: TEAM_TECH,
  },
  {
    name: "Santos",
    role: "Full Stack Developer",
    skills: TEAM_TECH,
  },
  {
    name: "Ecxal",
    role: "WordPress Specialist",
    skills: TEAM_TECH,
  },
];
