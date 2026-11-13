import { marketingImages } from "@/lib/marketing/images";

export const siteNav = {
  phone: "855-997-4652",
  phoneHref: "tel:+18559974652",
  loginHref: "/login",
  trialHref: "/free-class",
  schoolsHref: "/schools",
} as const;

/** Honest launch metrics — no inflated social proof. */
export const heroStats = [
  { value: "1:1", label: "Live with a teacher" },
  { value: "25–50", label: "Minute sessions" },
  { value: "Native", label: "Spanish instructors" },
] as const;

export const hero = {
  eyebrow: "Native Speak · Now welcoming learners",
  title: "Spanish you actually speak — with a live teacher, on your schedule",
  subtitle:
    "We are a new online academy built around conversation, not canned videos. Start with a free class; no credit card.",
  highlights: [
    "Live sessions",
    "Certified teachers",
    "All ages",
    "Flexible booking",
  ] as const,
  ctaPrimary: "Try a free class",
  schoolsNote: "Building a school partnership?",
  schoolsLink: "Talk with us",
  imageCaptionTitle: "Your first session",
  imageCaptionBody:
    "Meet your teacher, set goals, and practice real dialogue — even if you are starting from zero.",
};

export const audienceStrip = {
  label: "Designed for",
  items: [
    "Homeschool families",
    "Kids & teens",
    "Adult learners",
    "Pilot school groups",
  ] as const,
};

export const howItWorksSection = {
  eyebrow: "How it works",
  title: "From signup to your first conversation",
  subtitle:
    "Create an account, schedule classes, and meet your teacher live — see the full process on How it works.",
  steps: [
    {
      step: "01",
      title: "Create an account",
      body: "Select class duration and number, then create your account before submitting payment.",
    },
    {
      step: "02",
      title: "Schedule your classes",
      body: "Log in, view teacher availability, and book classes to fit your schedule.",
    },
    {
      step: "03",
      title: "Connect to your teacher",
      body: "Join on Google Meet with your certified teacher and download class materials in PDF anytime.",
    },
  ],
  image: marketingImages.conversation,
  imageAlt: marketingImages.conversationAlt,
} as const;

export const programsSection = {
  title: "Programs by age and goal",
  subtitle:
    "Choose a track that fits today. We will refine placement after your free class.",
};

export const programLevels = [
  { id: "preschool", label: "Preschool" },
  { id: "elementary", label: "Elementary" },
  { id: "middle", label: "Middle School" },
  { id: "high", label: "High School" },
  { id: "adults", label: "Adults" },
  { id: "schools", label: "Schools" },
] as const;

export type ProgramLevelId = (typeof programLevels)[number]["id"];

export const programs: Record<
  ProgramLevelId,
  {
    title: string;
    meta?: string;
    body: string;
  }
> = {
  preschool: {
    title: "Preschool",
    meta: "Sessions · 25 min · Ages 5–6",
    body: "Playful introductions to sounds, greetings, colors, and simple phrases — always with a patient teacher on screen.",
  },
  elementary: {
    title: "Elementary",
    meta: "Sessions · 25 min · Ages 6–10",
    body: "Confidence through short conversations, age-appropriate vocabulary, and habits that fit homeschool or after-school routines.",
  },
  middle: {
    title: "Middle School",
    meta: "Sessions · 50 min · Ages 10–13",
    body: "Structured speaking practice, growing grammar in context, and feedback that encourages risk-taking in Spanish.",
  },
  high: {
    title: "High School",
    meta: "Sessions · 50 min · Ages 13–18",
    body: "Rigorous conversation blocks for students who need fluency, exam prep, or a path toward transcript goals — we will document progress with you.",
  },
  adults: {
    title: "Adults",
    meta: "Sessions · 50 min · Ages 18+",
    body: "Travel, work, heritage, or curiosity: learn at your pace with a teacher who adapts to your life, not a one-size app.",
  },
  schools: {
    title: "Schools",
    body: "Pilot live Spanish with cohort scheduling, parent-friendly reporting, and a partner contact — ideal while we scale instruction capacity.",
  },
};

export const progressSection = {
  title: "What every class is built around",
  subtitle:
    "We are early-stage, but these principles do not change: live Spanish, clear expectations, and respect for your calendar.",
};

export const operatingHours = {
  title: "Scheduling",
  timezone: "Times shown in Central America (GMT−6) · Expanded hours as we hire",
  rows: [
    "Weekdays · Morning through evening slots",
    "Saturday · Morning blocks",
    "Need a specific window? Ask when you book your free class",
  ],
} as const;

export const youCanExpect = {
  title: "Included in the experience",
  items: [
    "Live video instruction",
    "Native Spanish teachers",
    "Placement after your trial",
    "Notes after sessions (rolling out)",
    "Flexible reschedule policy",
    "1:1 or paired options when available",
    "Transparent pricing",
    "Support in English when you need it",
  ],
} as const;

export const footer = {
  brand: "Native Speak",
  tagline:
    "A conversation-first Spanish academy in launch — personalized live classes for learners and families.",
  columns: [
    {
      title: "Programs",
      links: [
        { label: "All programs", href: "/programs" },
        { label: "Preschool", href: "/programs/preschool" },
        { label: "High school", href: "/programs/high-school" },
        { label: "School pilots", href: "/schools" },
      ],
    },
    {
      title: "Get started",
      links: [
        { label: "Pricing", href: "/pricing" },
        { label: "How it works", href: "/how-it-works" },
        { label: "Book a session", href: "/free-class" },
        { label: "Log in", href: "/login" },
        { label: "Blog", href: "/blog" },
      ],
    },
  ],
} as const;
