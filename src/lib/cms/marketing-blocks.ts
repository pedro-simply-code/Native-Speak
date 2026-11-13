/**
 * Native Speak marketing page blocks — data shapes, node type constants, defaults.
 * Mirrors src/components/marketing and app (public) page sections.
 */

import {
  howItWorksSection,
  operatingHours,
  progressSection,
  programLevels,
  programs,
  programsSection,
  siteNav,
  youCanExpect,
} from "@/lib/marketing/home-content";
import {
  classIncludesSection,
  howItWorksFaq,
  howItWorksOnboarding,
  howItWorksPage,
  pricingTestimonialsSection,
  proveProgressSection,
  teacherHiring,
} from "@/lib/marketing/how-it-works-content";
import { marketingImages } from "@/lib/marketing/images";
import {
  aboutContent,
  freeClassContent,
  schoolsContent,
} from "@/lib/marketing/pages-content";
import { pricingPage } from "@/lib/marketing/pricing-content";
import { programIdToSlug } from "@/lib/marketing/navigation";

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function strList(value: unknown, fallback: readonly string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

/* --- Onboarding trio (How it works) --- */

export const ONBOARDING_TRIO_SECTION_NODE_TYPE = "onboarding-trio-section";

export type OnboardingTrioItem = { title: string; body: string };

export type OnboardingTrioSectionData = {
  stepLabelTemplate: string;
  items: OnboardingTrioItem[];
};

export const DEFAULT_ONBOARDING_TRIO_SECTION: OnboardingTrioSectionData = {
  stepLabelTemplate: "Step {n}",
  items: howItWorksOnboarding.map((s) => ({ title: s.title, body: s.body })),
};

export function normalizeOnboardingTrioSectionData(
  value: unknown,
): OnboardingTrioSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_ONBOARDING_TRIO_SECTION,
      items: DEFAULT_ONBOARDING_TRIO_SECTION.items.map((i) => ({ ...i })),
    };
  }
  const source = value as Record<string, unknown>;
  const items = Array.isArray(source.items)
    ? source.items.slice(0, 6).map((row) => {
        const r =
          row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        return {
          title: str(r.title, "Step"),
          body: str(r.body, ""),
        };
      })
    : DEFAULT_ONBOARDING_TRIO_SECTION.items;
  return {
    stepLabelTemplate: str(
      source.stepLabelTemplate,
      DEFAULT_ONBOARDING_TRIO_SECTION.stepLabelTemplate,
    ),
    items: items.length ? items : DEFAULT_ONBOARDING_TRIO_SECTION.items,
  };
}

/* --- Bullet list (+ optional intro) --- */

export const BULLET_LIST_SECTION_NODE_TYPE = "bullet-list-section";

export type BulletListSectionData = {
  title: string;
  intro: string;
  bullets: string[];
};

export const DEFAULT_BULLET_LIST_SECTION: BulletListSectionData = {
  title: teacherHiring.title,
  intro: teacherHiring.intro,
  bullets: [...teacherHiring.bullets],
};

export function normalizeBulletListSectionData(
  value: unknown,
): BulletListSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_BULLET_LIST_SECTION,
      bullets: [...DEFAULT_BULLET_LIST_SECTION.bullets],
    };
  }
  const source = value as Record<string, unknown>;
  return {
    title: str(source.title, DEFAULT_BULLET_LIST_SECTION.title),
    intro: str(source.intro, DEFAULT_BULLET_LIST_SECTION.intro),
    bullets: strList(source.bullets, DEFAULT_BULLET_LIST_SECTION.bullets),
  };
}

/* --- Bullet list + CTA (Schools) --- */

export const BULLET_CTA_SECTION_NODE_TYPE = "bullet-cta-section";

export type BulletCtaSectionData = {
  bullets: string[];
  buttonLabel: string;
  buttonHref: string;
};

export const DEFAULT_BULLET_CTA_SECTION: BulletCtaSectionData = {
  bullets: [...schoolsContent.bullets],
  buttonLabel: "Schedule a partner call",
  buttonHref: siteNav.trialHref,
};

export function normalizeBulletCtaSectionData(
  value: unknown,
): BulletCtaSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_BULLET_CTA_SECTION,
      bullets: [...DEFAULT_BULLET_CTA_SECTION.bullets],
    };
  }
  const source = value as Record<string, unknown>;
  return {
    bullets: strList(source.bullets, DEFAULT_BULLET_CTA_SECTION.bullets),
    buttonLabel: str(
      source.buttonLabel,
      DEFAULT_BULLET_CTA_SECTION.buttonLabel,
    ),
    buttonHref: str(source.buttonHref, DEFAULT_BULLET_CTA_SECTION.buttonHref),
  };
}

/* --- FAQ --- */

export const FAQ_SECTION_NODE_TYPE = "faq-section";

export type FaqItem = { question: string; answer: string };

export type FaqSectionData = {
  title: string;
  introBefore: string;
  introLinkLabel: string;
  introLinkHref: string;
  introAfter: string;
  items: FaqItem[];
};

export const DEFAULT_FAQ_SECTION: FaqSectionData = {
  title: "Frequently asked questions",
  introBefore: "Choosing packages or credit? See also",
  introLinkLabel: "pricing",
  introLinkHref: "/pricing",
  introAfter: ".",
  items: howItWorksFaq.map((f) => ({ ...f })),
};

export function normalizeFaqSectionData(value: unknown): FaqSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_FAQ_SECTION,
      items: DEFAULT_FAQ_SECTION.items.map((i) => ({ ...i })),
    };
  }
  const source = value as Record<string, unknown>;
  const items = Array.isArray(source.items)
    ? source.items.slice(0, 20).map((row) => {
        const r =
          row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        return {
          question: str(r.question, "Question"),
          answer: str(r.answer, ""),
        };
      })
    : DEFAULT_FAQ_SECTION.items;
  return {
    title: str(source.title, DEFAULT_FAQ_SECTION.title),
    introBefore: str(source.introBefore, DEFAULT_FAQ_SECTION.introBefore),
    introLinkLabel: str(
      source.introLinkLabel,
      DEFAULT_FAQ_SECTION.introLinkLabel,
    ),
    introLinkHref: str(
      source.introLinkHref,
      DEFAULT_FAQ_SECTION.introLinkHref,
    ),
    introAfter: str(source.introAfter, DEFAULT_FAQ_SECTION.introAfter),
    items: items.length ? items : DEFAULT_FAQ_SECTION.items,
  };
}

/* --- Dual CTA (How it works footer) --- */

export const DUAL_CTA_SECTION_NODE_TYPE = "dual-cta-section";

export type DualCtaSectionData = {
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export const DEFAULT_DUAL_CTA_SECTION: DualCtaSectionData = {
  title: "What are you waiting for?",
  body: "Start with a free class or browse packages on the pricing page.",
  primaryLabel: "Try a free class",
  primaryHref: siteNav.trialHref,
  secondaryLabel: "View pricing",
  secondaryHref: "/pricing",
};

export function normalizeDualCtaSectionData(
  value: unknown,
): DualCtaSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_DUAL_CTA_SECTION };
  }
  const source = value as Record<string, unknown>;
  return {
    title: str(source.title, DEFAULT_DUAL_CTA_SECTION.title),
    body: str(source.body, DEFAULT_DUAL_CTA_SECTION.body),
    primaryLabel: str(
      source.primaryLabel,
      DEFAULT_DUAL_CTA_SECTION.primaryLabel,
    ),
    primaryHref: str(
      source.primaryHref,
      DEFAULT_DUAL_CTA_SECTION.primaryHref,
    ),
    secondaryLabel: str(
      source.secondaryLabel,
      DEFAULT_DUAL_CTA_SECTION.secondaryLabel,
    ),
    secondaryHref: str(
      source.secondaryHref,
      DEFAULT_DUAL_CTA_SECTION.secondaryHref,
    ),
  };
}

/* --- Testimonials grid (Pricing) --- */

export const TESTIMONIALS_SECTION_NODE_TYPE = "testimonials-section";

export type TestimonialItem = { quote: string; author: string };

export type TestimonialsSectionData = {
  title: string;
  items: TestimonialItem[];
};

export const DEFAULT_TESTIMONIALS_SECTION: TestimonialsSectionData = {
  title: pricingTestimonialsSection.title,
  items: pricingTestimonialsSection.items.map((i) => ({ ...i })),
};

export function normalizeTestimonialsSectionData(
  value: unknown,
): TestimonialsSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_TESTIMONIALS_SECTION,
      items: DEFAULT_TESTIMONIALS_SECTION.items.map((i) => ({ ...i })),
    };
  }
  const source = value as Record<string, unknown>;
  const items = Array.isArray(source.items)
    ? source.items.slice(0, 9).map((row) => {
        const r =
          row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        return {
          quote: str(r.quote, ""),
          author: str(r.author, ""),
        };
      })
    : DEFAULT_TESTIMONIALS_SECTION.items;
  return {
    title: str(source.title, DEFAULT_TESTIMONIALS_SECTION.title),
    items: items.length ? items : DEFAULT_TESTIMONIALS_SECTION.items,
  };
}

/* --- Lead form (Free class) --- */

export const LEAD_FORM_SECTION_NODE_TYPE = "lead-form-section";

export type LeadFormSectionData = {
  submitLabel: string;
};

export const DEFAULT_LEAD_FORM_SECTION: LeadFormSectionData = {
  submitLabel: "Request free class",
};

export function normalizeLeadFormSectionData(
  value: unknown,
): LeadFormSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_LEAD_FORM_SECTION };
  }
  const source = value as Record<string, unknown>;
  return {
    submitLabel: str(
      source.submitLabel,
      DEFAULT_LEAD_FORM_SECTION.submitLabel,
    ),
  };
}

/* --- Pricing picker --- */

export const PRICING_PICKER_SECTION_NODE_TYPE = "pricing-picker-section";

export type PricingPickerSectionData = Record<string, unknown>;

export const DEFAULT_PRICING_PICKER_SECTION: PricingPickerSectionData = {};

export function normalizePricingPickerSectionData(
  value: unknown,
): PricingPickerSectionData {
  return value && typeof value === "object" && !Array.isArray(value)
    ? {}
    : DEFAULT_PRICING_PICKER_SECTION;
}

/* --- Progress / expectations (Home) --- */

export const PROGRESS_SECTION_NODE_TYPE = "progress-section";

export type ProgressSectionData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  leftTitle: string;
  leftSubtitle: string;
  leftRows: string[];
  rightTitle: string;
  rightItems: string[];
  ctaBody: string;
  ctaLabel: string;
  ctaHref: string;
};

export const DEFAULT_PROGRESS_SECTION: ProgressSectionData = {
  eyebrow: "What to expect",
  title: progressSection.title,
  subtitle: progressSection.subtitle,
  leftTitle: operatingHours.title,
  leftSubtitle: operatingHours.timezone,
  leftRows: [...operatingHours.rows],
  rightTitle: youCanExpect.title,
  rightItems: [...youCanExpect.items],
  ctaBody:
    "See how a live session fits your schedule. Pick a time and meet a certified teacher — no payment upfront.",
  ctaLabel: "Schedule your session",
  ctaHref: siteNav.trialHref,
};

export function normalizeProgressSectionData(
  value: unknown,
): ProgressSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_PROGRESS_SECTION,
      leftRows: [...DEFAULT_PROGRESS_SECTION.leftRows],
      rightItems: [...DEFAULT_PROGRESS_SECTION.rightItems],
    };
  }
  const source = value as Record<string, unknown>;
  return {
    eyebrow: str(source.eyebrow, DEFAULT_PROGRESS_SECTION.eyebrow),
    title: str(source.title, DEFAULT_PROGRESS_SECTION.title),
    subtitle: str(source.subtitle, DEFAULT_PROGRESS_SECTION.subtitle),
    leftTitle: str(source.leftTitle, DEFAULT_PROGRESS_SECTION.leftTitle),
    leftSubtitle: str(
      source.leftSubtitle,
      DEFAULT_PROGRESS_SECTION.leftSubtitle,
    ),
    leftRows: strList(source.leftRows, DEFAULT_PROGRESS_SECTION.leftRows),
    rightTitle: str(source.rightTitle, DEFAULT_PROGRESS_SECTION.rightTitle),
    rightItems: strList(source.rightItems, DEFAULT_PROGRESS_SECTION.rightItems),
    ctaBody: str(source.ctaBody, DEFAULT_PROGRESS_SECTION.ctaBody),
    ctaLabel: str(source.ctaLabel, DEFAULT_PROGRESS_SECTION.ctaLabel),
    ctaHref: str(source.ctaHref, DEFAULT_PROGRESS_SECTION.ctaHref),
  };
}

/* --- Programs showcase (Home tabs) --- */

export const PROGRAMS_SHOWCASE_SECTION_NODE_TYPE = "programs-showcase-section";

export type ProgramShowcaseLevel = {
  id: string;
  label: string;
  title: string;
  meta: string;
  body: string;
  imageSrc: string;
  href: string;
};

export type ProgramsShowcaseSectionData = {
  title: string;
  subtitle: string;
  levels: ProgramShowcaseLevel[];
};

export const DEFAULT_PROGRAMS_SHOWCASE_SECTION: ProgramsShowcaseSectionData = {
  title: programsSection.title,
  subtitle: programsSection.subtitle,
  levels: programLevels.map((level) => {
    const detail = programs[level.id];
    const slug = programIdToSlug[level.id];
    return {
      id: level.id,
      label: level.label,
      title: detail.title,
      meta: detail.meta ?? "",
      body: detail.body,
      imageSrc: marketingImages.programs[level.id],
      href: "/programs/" + slug,
    };
  }),
};

export function normalizeProgramsShowcaseSectionData(
  value: unknown,
): ProgramsShowcaseSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_PROGRAMS_SHOWCASE_SECTION,
      levels: DEFAULT_PROGRAMS_SHOWCASE_SECTION.levels.map((l) => ({ ...l })),
    };
  }
  const source = value as Record<string, unknown>;
  const levels = Array.isArray(source.levels)
    ? source.levels.slice(0, 8).map((row, index) => {
        const r =
          row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        const fallback = DEFAULT_PROGRAMS_SHOWCASE_SECTION.levels[index];
        return {
          id: str(r.id, fallback?.id ?? "level-" + String(index)),
          label: str(r.label, fallback?.label ?? "Program"),
          title: str(r.title, fallback?.title ?? "Program"),
          meta: str(r.meta, fallback?.meta ?? ""),
          body: str(r.body, fallback?.body ?? ""),
          imageSrc: str(r.imageSrc, fallback?.imageSrc ?? marketingImages.hero),
          href: str(r.href, fallback?.href ?? "/programs"),
        };
      })
    : DEFAULT_PROGRAMS_SHOWCASE_SECTION.levels;
  return {
    title: str(source.title, DEFAULT_PROGRAMS_SHOWCASE_SECTION.title),
    subtitle: str(source.subtitle, DEFAULT_PROGRAMS_SHOWCASE_SECTION.subtitle),
    levels: levels.length
      ? levels
      : DEFAULT_PROGRAMS_SHOWCASE_SECTION.levels,
  };
}

/* --- Programs grid (Programs index) --- */

export const PROGRAMS_GRID_SECTION_NODE_TYPE = "programs-grid-section";

export type ProgramGridCard = {
  title: string;
  meta: string;
  body: string;
  imageSrc: string;
  href: string;
};

export type ProgramsGridSectionData = {
  cards: ProgramGridCard[];
};

export const DEFAULT_PROGRAMS_GRID_SECTION: ProgramsGridSectionData = {
  cards: programLevels.map((level) => {
    const detail = programs[level.id];
    const slug = programIdToSlug[level.id];
    return {
      title: detail.title,
      meta: detail.meta ?? "",
      body: detail.body,
      imageSrc: marketingImages.programs[level.id],
      href: "/programs/" + slug,
    };
  }),
};

export function normalizeProgramsGridSectionData(
  value: unknown,
): ProgramsGridSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      cards: DEFAULT_PROGRAMS_GRID_SECTION.cards.map((c) => ({ ...c })),
    };
  }
  const source = value as Record<string, unknown>;
  const cards = Array.isArray(source.cards)
    ? source.cards.slice(0, 12).map((row, index) => {
        const r =
          row && typeof row === "object" ? (row as Record<string, unknown>) : {};
        const fallback = DEFAULT_PROGRAMS_GRID_SECTION.cards[index];
        return {
          title: str(r.title, fallback?.title ?? "Program"),
          meta: str(r.meta, fallback?.meta ?? ""),
          body: str(r.body, fallback?.body ?? ""),
          imageSrc: str(r.imageSrc, fallback?.imageSrc ?? marketingImages.hero),
          href: str(r.href, fallback?.href ?? "/programs"),
        };
      })
    : DEFAULT_PROGRAMS_GRID_SECTION.cards;
  return {
    cards: cards.length ? cards : DEFAULT_PROGRAMS_GRID_SECTION.cards,
  };
}

/* --- Program detail body --- */

export const PROGRAM_DETAIL_SECTION_NODE_TYPE = "program-detail-section";

export type ProgramDetailSectionData = {
  meta: string;
  body: string;
  chips: string[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  backLabel: string;
  backHref: string;
};

export const DEFAULT_PROGRAM_DETAIL_SECTION: ProgramDetailSectionData = {
  meta: programs.preschool.meta ?? "",
  body: programs.preschool.body,
  chips: [
    "Live video classes",
    "Native Spanish teachers",
    "Homework optional",
    "Flexible rescheduling",
  ],
  primaryLabel: "Book a free class",
  primaryHref: siteNav.trialHref,
  secondaryLabel: "View pricing",
  secondaryHref: "/pricing",
  backLabel: "← All programs",
  backHref: "/programs",
};

export function normalizeProgramDetailSectionData(
  value: unknown,
): ProgramDetailSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_PROGRAM_DETAIL_SECTION,
      chips: [...DEFAULT_PROGRAM_DETAIL_SECTION.chips],
    };
  }
  const source = value as Record<string, unknown>;
  return {
    meta: str(source.meta, DEFAULT_PROGRAM_DETAIL_SECTION.meta),
    body: str(source.body, DEFAULT_PROGRAM_DETAIL_SECTION.body),
    chips: strList(source.chips, DEFAULT_PROGRAM_DETAIL_SECTION.chips),
    primaryLabel: str(
      source.primaryLabel,
      DEFAULT_PROGRAM_DETAIL_SECTION.primaryLabel,
    ),
    primaryHref: str(
      source.primaryHref,
      DEFAULT_PROGRAM_DETAIL_SECTION.primaryHref,
    ),
    secondaryLabel: str(
      source.secondaryLabel,
      DEFAULT_PROGRAM_DETAIL_SECTION.secondaryLabel,
    ),
    secondaryHref: str(
      source.secondaryHref,
      DEFAULT_PROGRAM_DETAIL_SECTION.secondaryHref,
    ),
    backLabel: str(
      source.backLabel,
      DEFAULT_PROGRAM_DETAIL_SECTION.backLabel,
    ),
    backHref: str(source.backHref, DEFAULT_PROGRAM_DETAIL_SECTION.backHref),
  };
}

/* --- Blog index header --- */

export const BLOG_HEADER_SECTION_NODE_TYPE = "blog-header-section";

export type BlogHeaderSectionData = {
  title: string;
  description: string;
};

export const DEFAULT_BLOG_HEADER_SECTION: BlogHeaderSectionData = {
  title: "Blog",
  description:
    "Tips for families, teachers, and learners on the Native Speak journey.",
};

export function normalizeBlogHeaderSectionData(
  value: unknown,
): BlogHeaderSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_BLOG_HEADER_SECTION };
  }
  const source = value as Record<string, unknown>;
  return {
    title: str(source.title, DEFAULT_BLOG_HEADER_SECTION.title),
    description: str(
      source.description,
      DEFAULT_BLOG_HEADER_SECTION.description,
    ),
  };
}

/** Presets for page-header defaults per route */
export const PRESET_PAGE_HEADERS = {
  home: undefined,
  howItWorks: {
    eyebrow: "Process",
    headline: howItWorksPage.title,
    description: howItWorksPage.intro,
    image: marketingImages.conversation,
    imageAlt: marketingImages.conversationAlt,
  },
  pricing: {
    eyebrow: "Pricing",
    headline: pricingPage.title,
    description: pricingPage.intro,
    image: marketingImages.books,
    imageAlt: marketingImages.booksAlt,
  },
  about: {
    eyebrow: "Our story",
    headline: aboutContent.title,
    description: aboutContent.intro,
    image: aboutContent.image,
    imageAlt: aboutContent.imageAlt,
  },
  schools: {
    eyebrow: "Partnerships",
    headline: schoolsContent.title,
    description: schoolsContent.intro,
    image: schoolsContent.image,
    imageAlt: schoolsContent.imageAlt,
  },
  freeClass: {
    eyebrow: "Free trial",
    headline: freeClassContent.title,
    description: freeClassContent.intro,
    image: freeClassContent.image,
    imageAlt: freeClassContent.imageAlt,
  },
  programs: {
    eyebrow: "Programs",
    headline: "Spanish classes tailored to every stage",
    description:
      "From preschool immersion games to high school credit and school partnerships — each track uses live instruction with native teachers.",
    image: marketingImages.classroom,
    imageAlt: marketingImages.classroomAlt,
  },
} as const;

export const PRESET_FEATURE_GRID_CLASS_INCLUDES = {
  eyebrow: "",
  headline: classIncludesSection.title,
  description: "",
  features: classIncludesSection.items.map((item) => ({
    icon: "message" as const,
    title: item.title,
    body: item.body,
  })),
};

export const PRESET_FEATURE_GRID_PROGRESS = {
  eyebrow: "",
  headline: proveProgressSection.title,
  description: "",
  features: proveProgressSection.items.map((item) => ({
    icon: "message" as const,
    title: item.title,
    body: item.body,
  })),
};

export const NATIVE_SPEAK_MARKETING_BLOCK_TYPES = [
  ONBOARDING_TRIO_SECTION_NODE_TYPE,
  BULLET_LIST_SECTION_NODE_TYPE,
  BULLET_CTA_SECTION_NODE_TYPE,
  FAQ_SECTION_NODE_TYPE,
  DUAL_CTA_SECTION_NODE_TYPE,
  TESTIMONIALS_SECTION_NODE_TYPE,
  LEAD_FORM_SECTION_NODE_TYPE,
  PRICING_PICKER_SECTION_NODE_TYPE,
  PROGRESS_SECTION_NODE_TYPE,
  PROGRAMS_SHOWCASE_SECTION_NODE_TYPE,
  PROGRAMS_GRID_SECTION_NODE_TYPE,
  PROGRAM_DETAIL_SECTION_NODE_TYPE,
  BLOG_HEADER_SECTION_NODE_TYPE,
] as const;
