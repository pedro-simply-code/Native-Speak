export type ServiceTool = { label: string; href?: string };

export type Service = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  deliverables: string[];
  tools: ServiceTool[];
};

export const SERVICES: Service[] = [
  {
    slug: "ux-design",
    title: "UX & Design",
    summary:
      "Full product design in Figma: research, user flows, interactive prototypes and complete design systems.",
    description:
      "Design is where the project is won or lost. We start with the people using the product and the business behind it, then design the flows, interface and system that hold up after launch — not just in a presentation.",
    deliverables: [
      "Discovery and requirements workshops",
      "User flows and information architecture",
      "Wireframes and high-fidelity screens in Figma",
      "Interactive prototypes for validation",
      "Design systems and component libraries",
    ],
    tools: [
      { label: "Figma", href: "https://www.figma.com/" },
      { label: "Prototyping" },
      { label: "Design systems" },
    ],
  },
  {
    slug: "full-stack",
    title: "Full Stack & Systems",
    summary:
      "End-to-end platforms: relational data architecture, role-based permissions and real-time workflows.",
    description:
      "When a site becomes a system, the data model decides how far it can grow. We design and build the platform end to end: schema, permissions, APIs, interfaces and deployment, with code the next developer can read.",
    deliverables: [
      "Relational data modelling",
      "Authentication and role-based permissions",
      "API design and integrations",
      "Dashboards, portals and internal tools",
      "Deployment, monitoring and handover",
    ],
    tools: [
      { label: "Next.js", href: "https://nextjs.org/" },
      { label: "React", href: "https://react.dev/" },
      { label: "PostgreSQL", href: "https://www.postgresql.org/" },
      { label: "Vercel", href: "https://vercel.com/" },
    ],
  },
  {
    slug: "wordpress-development",
    title: "WordPress Development",
    summary:
      "Custom themes built from scratch, plus builder-based builds with ACF, Bootstrap and Visual Composer.",
    description:
      "WordPress is still the right answer for a lot of content-driven sites — when it is built properly. We write custom themes instead of bending a template, so the editing experience is simple and the front end stays fast.",
    deliverables: [
      "Custom themes from provided designs",
      "Advanced Custom Fields content models",
      "Visual Composer and block-based page building",
      "Multilingual sites with WPML",
      "Migrations, performance and maintenance",
    ],
    tools: [
      { label: "ACF", href: "https://www.advancedcustomfields.com/" },
      { label: "Visual Composer", href: "https://visualcomposer.com/" },
      { label: "WPML", href: "https://wpml.org/" },
      { label: "Bootstrap", href: "https://getbootstrap.com/" },
    ],
  },
  {
    slug: "agency-partnerships",
    title: "Agency Partnerships",
    summary:
      "White-label design and development for marketing and design agencies, built on long-term relationships.",
    description:
      "Agencies bring us in when the scope is bigger than the bench. We work inside your process, under your brand, with the same developers on every project — so you can promise senior delivery without hiring for it.",
    deliverables: [
      "White-label design and development",
      "Overflow capacity for parallel projects",
      "Direct communication with the developers",
      "Estimation and technical scoping support",
      "Long-term maintenance and retainers",
    ],
    tools: [
      { label: "Lemonade Stand", href: "https://www.lemonadestand.org/" },
      { label: "Thinker Ventures", href: "https://thinkerventures.com/" },
      { label: "Mod Creatives", href: "http://www.modcreatives.com/" },
      { label: "BTD Brand", href: "https://btdbrand.com/" },
    ],
  },
];

export type EngagementModel = {
  title: string;
  description: string;
  bestFor: string;
};

export const ENGAGEMENT_MODELS: EngagementModel[] = [
  {
    title: "Fixed-scope project",
    description:
      "A defined outcome, a written scope and a fixed quote. We plan the work in stages and you approve the design before development starts.",
    bestFor:
      "New sites, redesigns and platform rebuilds with a clear finish line.",
  },
  {
    title: "Monthly retainer",
    description:
      "An agreed number of hours or deliverables each month, with direct access to the developers doing the work.",
    bestFor:
      "Ongoing improvements, maintenance and teams without in-house engineering.",
  },
  {
    title: "White-label partnership",
    description:
      "Development capacity under your agency's brand, inside your process, with the same team on every project.",
    bestFor: "Agencies that need to scale delivery without adding headcount.",
  },
];
