/**
 * Homepage CMS section blocks (Lexical decorators). Types, defaults, normalize.
 */

import { isExternalHref } from "@/lib/cms/link-options";
import { STATIC_CLIENT_PROOF_INTRO } from "@/lib/cms/reviews";

export const SERVICES_SECTION_NODE_TYPE = "services-section";
export const WORK_SECTION_NODE_TYPE = "work-section";
export const REVIEWS_SECTION_NODE_TYPE = "reviews-section";
export const WHY_SECTION_NODE_TYPE = "why-section";
export const CONTACT_SECTION_NODE_TYPE = "contact-section";
export const CTA_SECTION_NODE_TYPE = "cta-section";

export const HOMEPAGE_BLOCK_NODE_TYPES = [
  SERVICES_SECTION_NODE_TYPE,
  WORK_SECTION_NODE_TYPE,
  REVIEWS_SECTION_NODE_TYPE,
  WHY_SECTION_NODE_TYPE,
  CONTACT_SECTION_NODE_TYPE,
  CTA_SECTION_NODE_TYPE,
] as const;

function str(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/* --- Services --- */

export type ServicesCardIcon = "palette" | "database" | "globe" | "users";

export type ServicesSectionCard = {
  title: string;
  summary: string;
  href: string;
  tools: { label: string; href?: string }[];
  icon: ServicesCardIcon;
};

export type ServicesSectionData = {
  eyebrow: string;
  headline: string;
  description: string;
  cardSource: "site" | "custom";
  customCards: ServicesSectionCard[];
  columns: 2 | 3;
  showAgencySpotlight: boolean;
};

export const DEFAULT_SERVICES_SECTION: ServicesSectionData = {
  eyebrow: "Our Services",
  headline: "What We Do Best",
  description:
    "From product design and prototyping to full-stack builds, we deliver comprehensive digital services tailored to your business needs.",
  cardSource: "site",
  customCards: [],
  columns: 3,
  showAgencySpotlight: true,
};

export function normalizeServicesSectionData(
  value: unknown,
): ServicesSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_SERVICES_SECTION,
      customCards: [],
    };
  }
  const source = value as Record<string, unknown>;
  const cardSource = source.cardSource === "custom" ? "custom" : "site";
  const customCards = Array.isArray(source.customCards)
    ? source.customCards.slice(0, 12).map(normalizeServiceCard)
    : [];
  return {
    eyebrow: str(source.eyebrow, DEFAULT_SERVICES_SECTION.eyebrow),
    headline: str(source.headline, DEFAULT_SERVICES_SECTION.headline),
    description: str(source.description, DEFAULT_SERVICES_SECTION.description),
    cardSource,
    customCards,
    columns: Number(source.columns) === 2 ? 2 : 3,
    showAgencySpotlight: bool(
      source.showAgencySpotlight,
      DEFAULT_SERVICES_SECTION.showAgencySpotlight,
    ),
  };
}

function normalizeServiceCard(value: unknown): ServicesSectionCard {
  const row =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const icon = row.icon;
  const icons: ServicesCardIcon[] = ["palette", "database", "globe", "users"];
  return {
    title: str(row.title, "Service"),
    summary: str(row.summary, ""),
    href: str(row.href, "/services"),
    tools: Array.isArray(row.tools)
      ? row.tools.slice(0, 8).map((t) => {
          const tool =
            t && typeof t === "object" ? (t as Record<string, unknown>) : {};
          const href = str(tool.href, "");
          return {
            label: str(tool.label, ""),
            ...(href ? { href } : {}),
          };
        })
      : [],
    icon: icons.includes(icon as ServicesCardIcon)
      ? (icon as ServicesCardIcon)
      : "palette",
  };
}

/* --- Featured work --- */

export type WorkSectionData = {
  eyebrow: string;
  headline: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  ctaNewTab: boolean;
  showCta: boolean;
  projectCount: number;
  emptyMessage: string;
  /** Featured grid (homepage) vs full portfolio listing. */
  variant: "featured" | "portfolio";
  /** Portfolio only: tag filter bar like /work. */
  showTagFilter: boolean;
};

export const DEFAULT_WORK_SECTION: WorkSectionData = {
  eyebrow: "Our Work",
  headline: "Featured Projects",
  description:
    "A selection of our recent work showcasing the quality and diversity of solutions we deliver.",
  ctaLabel: "See All Our Work",
  ctaHref: "/work",
  ctaNewTab: false,
  showCta: true,
  projectCount: 3,
  emptyMessage: "New case studies are on the way.",
  variant: "featured",
  showTagFilter: false,
};

export const DEFAULT_PROJECTS_SECTION: WorkSectionData = {
  eyebrow: "Projects",
  headline: "Work That Speaks\nFor Itself",
  description:
    "Platform rebuilds, custom WordPress themes and long-term partnerships. Every project below was designed, built or led by our team.",
  ctaLabel: "",
  ctaHref: "/work",
  ctaNewTab: false,
  showCta: false,
  projectCount: 6,
  emptyMessage: "No projects published yet.",
  /**
   * Persisted JSON value stays `"portfolio"` so existing CMS documents keep
   * working; the editor labels this block "Projects".
   */
  variant: "portfolio",
  showTagFilter: true,
};

export function normalizeWorkSectionData(value: unknown): WorkSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_WORK_SECTION };
  }
  const source = value as Record<string, unknown>;
  const href = str(source.ctaHref, DEFAULT_WORK_SECTION.ctaHref);
  const count = Number(source.projectCount);
  const variant = source.variant === "portfolio" ? "portfolio" : "featured";
  return {
    eyebrow: str(source.eyebrow, DEFAULT_WORK_SECTION.eyebrow),
    headline: str(source.headline, DEFAULT_WORK_SECTION.headline),
    description: str(source.description, DEFAULT_WORK_SECTION.description),
    ctaLabel: str(source.ctaLabel, DEFAULT_WORK_SECTION.ctaLabel),
    ctaHref: href,
    ctaNewTab: bool(source.ctaNewTab, isExternalHref(href)),
    showCta: bool(source.showCta, DEFAULT_WORK_SECTION.showCta),
    projectCount:
      count >= 1 && count <= 6
        ? Math.floor(count)
        : DEFAULT_WORK_SECTION.projectCount,
    emptyMessage: str(source.emptyMessage, DEFAULT_WORK_SECTION.emptyMessage),
    variant,
    showTagFilter: bool(
      source.showTagFilter,
      variant === "portfolio" ? DEFAULT_PROJECTS_SECTION.showTagFilter : false,
    ),
  };
}

/* --- Reviews / client proof --- */

export type ReviewsSectionData = {
  eyebrow: string;
  headline: string;
  description: string;
  emptyEyebrow: string;
  emptyHeadline: string;
  emptyDescription: string;
};

export const DEFAULT_REVIEWS_SECTION: ReviewsSectionData = {
  eyebrow: "Client Feedback",
  headline: "What Clients Say",
  description: STATIC_CLIENT_PROOF_INTRO,
  emptyEyebrow: "Client Outcomes",
  emptyHeadline: "The Work Speaks First",
  emptyDescription:
    "No stock testimonials and no invented metrics. Here is the record, with a case study behind every number.",
};

export function normalizeReviewsSectionData(
  value: unknown,
): ReviewsSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_REVIEWS_SECTION };
  }
  const source = value as Record<string, unknown>;
  return {
    eyebrow: str(source.eyebrow, DEFAULT_REVIEWS_SECTION.eyebrow),
    headline: str(source.headline, DEFAULT_REVIEWS_SECTION.headline),
    description: str(source.description, DEFAULT_REVIEWS_SECTION.description),
    emptyEyebrow: str(
      source.emptyEyebrow,
      DEFAULT_REVIEWS_SECTION.emptyEyebrow,
    ),
    emptyHeadline: str(
      source.emptyHeadline,
      DEFAULT_REVIEWS_SECTION.emptyHeadline,
    ),
    emptyDescription: str(
      source.emptyDescription,
      DEFAULT_REVIEWS_SECTION.emptyDescription,
    ),
  };
}

/* --- Why choose us --- */

export type WhyFeatureIcon = "ruler" | "layers" | "zap";

export type WhyFeature = {
  icon: WhyFeatureIcon;
  title: string;
  summary: string;
};

export type WhyBuildStepStatus = "done" | "active" | "queued";

export type WhyBuildStep = {
  label: string;
  status: WhyBuildStepStatus;
};

export type WhySectionData = {
  eyebrow: string;
  headline: string;
  description: string;
  features: WhyFeature[];
  linkLabel: string;
  linkHref: string;
  linkNewTab: boolean;
  showLink: boolean;
  panelTitle: string;
  buildSteps: WhyBuildStep[];
  showBuildPanel: boolean;
};

export const DEFAULT_WHY_FEATURES: WhyFeature[] = [
  {
    icon: "ruler",
    title: "Pixel-Perfect From Design",
    summary:
      "Your designs built exactly as drawn. No drift, no surprises — exact fidelity has been our specialty since day one.",
  },
  {
    icon: "layers",
    title: "Clean, Scalable Code",
    summary:
      "Built with best practices and modern technologies for long-term maintainability and growth.",
  },
  {
    icon: "zap",
    title: "Direct Communication",
    summary:
      "Talk directly to the developers building your project. No middlemen, no miscommunication.",
  },
];

const DEFAULT_BUILD_STEPS: WhyBuildStep[] = [
  { label: "Discovery & scope", status: "done" },
  { label: "UX design in Figma", status: "done" },
  { label: "Design approval", status: "done" },
  { label: "Content & assets", status: "done" },
  { label: "Build & integrate", status: "active" },
  { label: "Staging preview", status: "queued" },
  { label: "QA, tests & accessibility", status: "queued" },
  { label: "Performance & SEO audit", status: "queued" },
  { label: "Deploy & handover", status: "queued" },
];

export const DEFAULT_WHY_SECTION: WhySectionData = {
  eyebrow: "Why Choose Us",
  headline: "Built For Performance,\nDesigned For Growth",
  description:
    "We don't just build websites—we create digital solutions that perform. With direct communication to developers, proven processes, and a focus on clean code, we deliver results that last.",
  features: DEFAULT_WHY_FEATURES.map((f) => ({ ...f })),
  linkLabel: "Meet the team behind the work",
  linkHref: "/about#team",
  linkNewTab: false,
  showLink: true,
  panelTitle: "Build In Progress",
  buildSteps: DEFAULT_BUILD_STEPS.map((s) => ({ ...s })),
  showBuildPanel: true,
};

export function normalizeWhySectionData(value: unknown): WhySectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_WHY_SECTION,
      features: DEFAULT_WHY_FEATURES.map((f) => ({ ...f })),
      buildSteps: DEFAULT_BUILD_STEPS.map((s) => ({ ...s })),
    };
  }
  const source = value as Record<string, unknown>;
  const linkHref = str(source.linkHref, DEFAULT_WHY_SECTION.linkHref);
  const featureIcons: WhyFeatureIcon[] = ["ruler", "layers", "zap"];
  const features = Array.isArray(source.features)
    ? source.features.slice(0, 6).map((f) => {
        const row =
          f && typeof f === "object" ? (f as Record<string, unknown>) : {};
        const icon = row.icon;
        return {
          icon: featureIcons.includes(icon as WhyFeatureIcon)
            ? (icon as WhyFeatureIcon)
            : "ruler",
          title: str(row.title, ""),
          summary: str(row.summary, ""),
        };
      })
    : DEFAULT_WHY_FEATURES.map((x) => ({ ...x }));
  const statuses: WhyBuildStepStatus[] = ["done", "active", "queued"];
  const buildSteps = Array.isArray(source.buildSteps)
    ? source.buildSteps.slice(0, 12).map((s) => {
        const row =
          s && typeof s === "object" ? (s as Record<string, unknown>) : {};
        const status = row.status;
        return {
          label: str(row.label, ""),
          status: statuses.includes(status as WhyBuildStepStatus)
            ? (status as WhyBuildStepStatus)
            : "queued",
        };
      })
    : DEFAULT_BUILD_STEPS.map((x) => ({ ...x }));
  return {
    eyebrow: str(source.eyebrow, DEFAULT_WHY_SECTION.eyebrow),
    headline: str(source.headline, DEFAULT_WHY_SECTION.headline),
    description: str(source.description, DEFAULT_WHY_SECTION.description),
    features: features.filter((f) => f.title.trim() || f.summary.trim()),
    linkLabel: str(source.linkLabel, DEFAULT_WHY_SECTION.linkLabel),
    linkHref,
    linkNewTab: bool(source.linkNewTab, isExternalHref(linkHref)),
    showLink: bool(source.showLink, DEFAULT_WHY_SECTION.showLink),
    panelTitle: str(source.panelTitle, DEFAULT_WHY_SECTION.panelTitle),
    buildSteps: buildSteps.filter((s) => s.label.trim()),
    showBuildPanel: bool(
      source.showBuildPanel,
      DEFAULT_WHY_SECTION.showBuildPanel,
    ),
  };
}

/* --- Contact --- */

export type ContactSectionLayout = "band" | "page";

export type ContactDetailValueType = "text" | "link";

export type ContactDetailItem = {
  label: string;
  value: string;
  href: string;
  icon: string;
  /** Plain text line vs clickable link (chosen when adding the row). */
  valueType: ContactDetailValueType;
};

export type ContactSectionData = {
  /** Homepage band vs full `/contact` page layout. */
  layout: ContactSectionLayout;
  eyebrow: string;
  headline: string;
  description: string;
  faqLabel: string;
  faqHref: string;
  faqNewTab: boolean;
  showForm: boolean;
  showContactDetails: boolean;
  contactDetails: ContactDetailItem[];
  showNextSteps: boolean;
  nextStepsTitle: string;
  nextSteps: string[];
  faqLeadIn: string;
};

const DEFAULT_CONTACT_DETAILS: ContactDetailItem[] = [
  {
    label: "Email",
    value: "hello@simplycode.io",
    href: "mailto:hello@simplycode.io",
    icon: "mail",
    valueType: "link",
  },
  {
    label: "Response time",
    value: "Within one business day",
    href: "",
    icon: "clock",
    valueType: "text",
  },
  {
    label: "Location",
    value: "1235 S 2200 W, Syracuse, UT 84075, USA",
    href: "",
    icon: "map-pin",
    valueType: "text",
  },
];

export const DEFAULT_CONTACT_SECTION: ContactSectionData = {
  layout: "band",
  eyebrow: "Contact Us",
  headline: "Let's Talk About\nYour Project",
  description:
    "Ready to start your next web project? Tell us about your goals and we'll get back to you with a plan to bring your ideas to life.",
  faqLabel: "Questions about scope, timeline or pricing? Read the FAQ",
  faqHref: "/faq",
  faqNewTab: false,
  showForm: true,
  showContactDetails: false,
  contactDetails: DEFAULT_CONTACT_DETAILS.map((item) => ({ ...item })),
  showNextSteps: false,
  nextStepsTitle: "What happens next",
  nextSteps: [
    "1. We read your brief and reply with questions or a call invite.",
    "2. A short discovery call to understand scope, timeline and budget.",
    "3. A written proposal with stages, a timeline and a fixed quote.",
  ],
  faqLeadIn: "Questions about how we work?",
};

/** Defaults matching the static `/contact` page. */
export const DEFAULT_CONTACT_PAGE_SECTION: ContactSectionData = {
  ...DEFAULT_CONTACT_SECTION,
  layout: "page",
  eyebrow: "Contact",
  headline: "Let's Talk\nAbout Your Project",
  description:
    "Tell us what you are building, what is getting in the way and when you need it. You'll get a straight answer from the developer who would do the work — not a sales pitch.",
  faqLabel: "Read the FAQ",
  faqHref: "/faq",
  showContactDetails: true,
  showNextSteps: true,
  faqLeadIn: "Questions about how we work?",
  contactDetails: DEFAULT_CONTACT_DETAILS.map((item) => ({ ...item })),
};

const CONTACT_DETAIL_ICON_KEYS = [
  "mail",
  "clock",
  "map-pin",
  "phone",
  "globe",
  "none",
] as const;

function normalizeContactDetailIcon(value: unknown): string {
  if (
    typeof value === "string" &&
    (CONTACT_DETAIL_ICON_KEYS as readonly string[]).includes(value)
  ) {
    return value;
  }
  return "none";
}

function normalizeContactDetailItem(value: unknown): ContactDetailItem {
  const row =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const valueText = str(row.value, "");
  const href = str(row.href, "");
  const explicitType = row.valueType;
  const valueType: ContactDetailValueType =
    explicitType === "link" || explicitType === "text"
      ? explicitType
      : href.trim()
        ? "link"
        : "text";
  return {
    label: str(row.label, "Detail"),
    value: valueText,
    href: valueType === "link" ? href : "",
    icon: normalizeContactDetailIcon(row.icon),
    valueType,
  };
}

function normalizeContactDetails(
  value: unknown,
  legacySource?: Record<string, unknown>,
): ContactDetailItem[] {
  if (Array.isArray(value)) {
    return value.slice(0, 12).map(normalizeContactDetailItem);
  }

  if (legacySource && !Array.isArray(value)) {
    const email = str(legacySource.email, DEFAULT_CONTACT_DETAILS[0]!.value);
    const responseTime = str(
      legacySource.responseTime,
      DEFAULT_CONTACT_DETAILS[1]!.value,
    );
    const location = str(
      legacySource.location,
      DEFAULT_CONTACT_DETAILS[2]!.value,
    );
    if (
      legacySource.email !== undefined ||
      legacySource.responseTime !== undefined ||
      legacySource.location !== undefined
    ) {
      return [
        {
          label: "Email",
          value: email,
          href: email.includes("@")
            ? `mailto:${email.replace(/^mailto:/i, "")}`
            : "",
          icon: "mail",
          valueType: "link",
        },
        {
          label: "Response time",
          value: responseTime,
          href: "",
          icon: "clock",
          valueType: "text",
        },
        {
          label: "Location",
          value: location,
          href: "",
          icon: "map-pin",
          valueType: "text",
        },
      ];
    }
  }

  return DEFAULT_CONTACT_DETAILS.map((item) => ({ ...item }));
}

function normalizeNextStepsList(value: unknown): string[] {
  const fallback = DEFAULT_CONTACT_SECTION.nextSteps;
  if (Array.isArray(value)) {
    return value.slice(0, 12).map((step, index) => str(step, fallback[index] ?? ""));
  }
  return [...fallback];
}

export function normalizeContactSectionData(
  value: unknown,
): ContactSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_CONTACT_SECTION,
      contactDetails: DEFAULT_CONTACT_DETAILS.map((item) => ({ ...item })),
      nextSteps: [...DEFAULT_CONTACT_SECTION.nextSteps],
    };
  }
  const source = value as Record<string, unknown>;
  const faqHref = str(source.faqHref, DEFAULT_CONTACT_SECTION.faqHref);
  const layout = source.layout === "page" ? "page" : "band";
  return {
    layout,
    eyebrow: str(source.eyebrow, DEFAULT_CONTACT_SECTION.eyebrow),
    headline: str(source.headline, DEFAULT_CONTACT_SECTION.headline),
    description: str(source.description, DEFAULT_CONTACT_SECTION.description),
    faqLabel: str(source.faqLabel, DEFAULT_CONTACT_SECTION.faqLabel),
    faqHref,
    faqNewTab: bool(source.faqNewTab, isExternalHref(faqHref)),
    showForm: bool(source.showForm, DEFAULT_CONTACT_SECTION.showForm),
    showContactDetails: bool(
      source.showContactDetails,
      layout === "page",
    ),
    contactDetails: normalizeContactDetails(source.contactDetails, source),
    showNextSteps: bool(source.showNextSteps, layout === "page"),
    nextStepsTitle: str(
      source.nextStepsTitle,
      DEFAULT_CONTACT_SECTION.nextStepsTitle,
    ),
    nextSteps: normalizeNextStepsList(source.nextSteps),
    faqLeadIn: str(source.faqLeadIn, DEFAULT_CONTACT_SECTION.faqLeadIn),
  };
}

/* --- Marketing CTA (page footer band) --- */

export type CtaSectionData = {
  headline: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
  buttonNewTab: boolean;
  buttonNofollow: boolean;
  email: string;
  emailHref: string;
  emailNewTab: boolean;
  emailNofollow: boolean;
  responseNote: string;
  showEmail: boolean;
  showResponseNote: boolean;
};

export const DEFAULT_CTA_SECTION: CtaSectionData = {
  headline: "What are you waiting for?",
  description:
    "Start with a free class or browse packages on the pricing page.",
  buttonLabel: "Try a free class",
  buttonHref: "/free-class",
  buttonNewTab: false,
  buttonNofollow: false,
  email: "",
  emailHref: "",
  emailNewTab: false,
  emailNofollow: false,
  responseNote: "",
  showEmail: false,
  showResponseNote: false,
};

export function normalizeCtaSectionData(value: unknown): CtaSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ...DEFAULT_CTA_SECTION };
  }
  const source = value as Record<string, unknown>;
  const buttonHref = str(source.buttonHref, DEFAULT_CTA_SECTION.buttonHref);
  const email = str(source.email, DEFAULT_CTA_SECTION.email);
  return {
    headline: str(source.headline, DEFAULT_CTA_SECTION.headline),
    description: str(source.description, DEFAULT_CTA_SECTION.description),
    buttonLabel: str(source.buttonLabel, DEFAULT_CTA_SECTION.buttonLabel),
    buttonHref,
    buttonNewTab: bool(source.buttonNewTab, isExternalHref(buttonHref)),
    buttonNofollow: bool(source.buttonNofollow, false),
    email,
    emailHref: str(
      source.emailHref,
      email ? `mailto:${email}` : DEFAULT_CTA_SECTION.emailHref,
    ),
    emailNewTab: bool(source.emailNewTab, false),
    emailNofollow: bool(source.emailNofollow, false),
    responseNote: str(source.responseNote, DEFAULT_CTA_SECTION.responseNote),
    showEmail: bool(source.showEmail, DEFAULT_CTA_SECTION.showEmail),
    showResponseNote: bool(
      source.showResponseNote,
      DEFAULT_CTA_SECTION.showResponseNote,
    ),
  };
}
