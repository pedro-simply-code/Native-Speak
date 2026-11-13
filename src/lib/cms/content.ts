/**
 * Shared content model for the Studio CMS.
 *
 * Heavy editor code lives under `@/components/lexical`; this module stays
 * dependency-free so it can be imported from the Drizzle schema, server
 * actions and client components alike.
 */

import { isExternalHref } from "@/lib/cms/link-options";
import {
  audienceStrip,
  hero as mkHero,
  heroStats as mkHeroStats,
  siteNav,
} from "@/lib/marketing/home-content";
import { marketingImages } from "@/lib/marketing/images";

export const CONTENT_KINDS = ["page", "post"] as const;
export type ContentKindName = (typeof CONTENT_KINDS)[number];

export const CONTENT_STATUSES = ["draft", "published"] as const;
export type ContentStatusName = (typeof CONTENT_STATUSES)[number];

export const CONTENT_KIND_LABEL: Record<ContentKindName, string> = {
  page: "Page",
  post: "Post",
};

/** @deprecated Prefer route template “Homepage” in Studio. */
export const HOMEPAGE_CMS_SLUG = "home";

export const CONTENT_STATUS_LABEL: Record<ContentStatusName, string> = {
  draft: "Draft",
  published: "Published",
};

export type ContentPathFields = {
  kind: ContentKindName;
  slug: string;
  isHomepage?: boolean;
};

export function entryIsHomepage(entry: ContentPathFields): boolean {
  if (entry.kind !== "page") return false;
  return Boolean(entry.isHomepage) || entry.slug === HOMEPAGE_CMS_SLUG;
}

export function isContentKind(value: unknown): value is ContentKindName {
  return (
    typeof value === "string" &&
    (CONTENT_KINDS as readonly string[]).includes(value)
  );
}

export function isContentStatus(value: unknown): value is ContentStatusName {
  return (
    typeof value === "string" &&
    (CONTENT_STATUSES as readonly string[]).includes(value)
  );
}

/* -------------------------------------------------------------------------- */
/* Hero block                                                                  */
/* -------------------------------------------------------------------------- */

export type HeroStat = {
  value: string;
  label: string;
};

export type HeroButtonSlot = "primary" | "secondary";

export type HeroSurface = "alt" | "default" | "canvas";

export type HeroData = {
  eyebrow: string;
  headline: string;
  /** Substring of `headline` rendered in the accent colour (optional emphasis). */
  highlight: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  primaryNewTab: boolean;
  primaryNofollow: boolean;
  secondaryLabel: string;
  secondaryHref: string;
  secondaryNewTab: boolean;
  secondaryNofollow: boolean;
  /** Visible hero actions in left-to-right order. */
  buttonOrder: HeroButtonSlot[];
  /** Legacy Simply-Code panel copy — hidden when `showPanel` is false. */
  tagline: string;
  badge: string;
  panelText: string;
  stats: HeroStat[];
  surface: HeroSurface;
  /** @deprecated Native Speak uses the image column instead of the dark stats panel. */
  showPanel: boolean;
  /** Native Speak homepage hero */
  highlights: string[];
  imageSrc: string;
  imageAlt: string;
  imageCaptionTitle: string;
  imageCaptionBody: string;
  audienceLabel: string;
  audienceItems: string[];
  schoolsNote: string;
  schoolsLink: string;
  schoolsHref: string;
};

export function normalizeHeroSurface(value: unknown): HeroSurface {
  if (value === "default" || value === "canvas") return value;
  return "alt";
}

/** Public + editor hero band background. */
export function heroSectionSurfaceClass(surface: HeroSurface): string {
  switch (surface) {
    case "default":
      return "bg-sc-section text-sc-ink";
    case "canvas":
      return "bg-sc-canvas text-sc-ink";
    default:
      return "bg-sc-section-alt text-sc-ink";
  }
}

/** Matches the live Native Speak homepage hero (see `components/marketing/hero-section`). */
export const DEFAULT_HERO: HeroData = {
  eyebrow: mkHero.eyebrow,
  headline: mkHero.title,
  highlight: "",
  description: mkHero.subtitle,
  primaryLabel: mkHero.ctaPrimary,
  primaryHref: siteNav.trialHref,
  primaryNewTab: false,
  primaryNofollow: false,
  secondaryLabel: "Log in",
  secondaryHref: siteNav.loginHref,
  secondaryNewTab: false,
  secondaryNofollow: false,
  buttonOrder: ["primary", "secondary"],
  tagline: "",
  badge: "",
  panelText: "",
  stats: mkHeroStats.map((s) => ({ value: s.value, label: s.label })),
  surface: "default",
  showPanel: false,
  highlights: [...mkHero.highlights],
  imageSrc: marketingImages.hero,
  imageAlt: marketingImages.heroAlt,
  imageCaptionTitle: mkHero.imageCaptionTitle,
  imageCaptionBody: mkHero.imageCaptionBody,
  audienceLabel: audienceStrip.label,
  audienceItems: [...audienceStrip.items],
  schoolsNote: mkHero.schoolsNote,
  schoolsLink: mkHero.schoolsLink,
  schoolsHref: siteNav.schoolsHref,
};

function heroString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function heroBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function heroButtonSlot(value: unknown): value is HeroButtonSlot {
  return value === "primary" || value === "secondary";
}

function heroHasPrimaryLabel(label: string): boolean {
  return label.trim().length > 0;
}

function heroHasSecondaryLabel(label: string): boolean {
  return label.trim().length > 0;
}

/** Legacy + persisted JSON → display order for filled / outline actions. */
export function normalizeHeroButtonOrder(
  source: Record<string, unknown>,
  primaryLabel: string,
  secondaryLabel: string,
): HeroButtonSlot[] {
  const hasPrimary = heroHasPrimaryLabel(primaryLabel);
  const hasSecondary = heroHasSecondaryLabel(secondaryLabel);

  const fromSource = Array.isArray(source.buttonOrder)
    ? source.buttonOrder.filter(heroButtonSlot)
    : null;

  let order: HeroButtonSlot[];

  if (fromSource && fromSource.length > 0) {
    order = fromSource.filter((slot) =>
      slot === "primary" ? hasPrimary : hasSecondary,
    );
    if (hasPrimary && !order.includes("primary")) order.push("primary");
    if (hasSecondary && !order.includes("secondary")) order.push("secondary");
  } else if (hasPrimary && hasSecondary) {
    order = ["primary", "secondary"];
  } else if (hasPrimary) {
    order = ["primary"];
  } else if (hasSecondary) {
    order = ["secondary"];
  } else {
    order = [];
  }

  return order;
}

export function heroButtonsInDisplayOrder(data: HeroData): HeroButtonSlot[] {
  return data.buttonOrder.filter((slot) =>
    slot === "primary"
      ? heroHasPrimaryLabel(data.primaryLabel)
      : heroHasSecondaryLabel(data.secondaryLabel),
  );
}

export function appendHeroButtonOrder(
  order: HeroButtonSlot[],
  slot: HeroButtonSlot,
): HeroButtonSlot[] {
  if (order.includes(slot)) return order;
  return [...order, slot];
}

export function removeHeroButtonFromOrder(
  order: HeroButtonSlot[],
  slot: HeroButtonSlot,
): HeroButtonSlot[] {
  return order.filter((entry) => entry !== slot);
}

/** Coerce persisted JSON into a complete hero payload. */
export function normalizeHeroData(value: unknown): HeroData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      ...DEFAULT_HERO,
      stats: DEFAULT_HERO.stats.map((stat) => ({ ...stat })),
      buttonOrder: [...DEFAULT_HERO.buttonOrder],
    };
  }

  const source = value as Record<string, unknown>;
  const headline = heroString(
    source.headline,
    heroString(source.title, DEFAULT_HERO.headline),
  );
  const description = heroString(
    source.description,
    heroString(source.subtitle, DEFAULT_HERO.description),
  );
  const stats = Array.isArray(source.stats)
    ? source.stats
        .slice(0, 6)
        .map((stat) => {
          const row =
            stat && typeof stat === "object"
              ? (stat as Record<string, unknown>)
              : {};
          return {
            value: heroString(row.value, ""),
            label: heroString(row.label, ""),
          };
        })
        .filter((stat) => stat.value.trim() || stat.label.trim())
    : [];

  const highlights = Array.isArray(source.highlights)
    ? source.highlights
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 8)
    : DEFAULT_HERO.highlights;

  const audienceItems = Array.isArray(source.audienceItems)
    ? source.audienceItems
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 8)
    : DEFAULT_HERO.audienceItems;

  return {
    eyebrow: heroString(source.eyebrow, DEFAULT_HERO.eyebrow),
    headline,
    highlight: heroString(source.highlight, DEFAULT_HERO.highlight),
    description,
    primaryLabel: heroString(source.primaryLabel, DEFAULT_HERO.primaryLabel),
    primaryHref: heroString(source.primaryHref, DEFAULT_HERO.primaryHref),
    primaryNewTab: heroBool(
      source.primaryNewTab,
      isExternalHref(heroString(source.primaryHref, DEFAULT_HERO.primaryHref)),
    ),
    primaryNofollow: heroBool(
      source.primaryNofollow,
      DEFAULT_HERO.primaryNofollow,
    ),
    secondaryLabel: heroString(
      source.secondaryLabel,
      DEFAULT_HERO.secondaryLabel,
    ),
    secondaryHref: heroString(source.secondaryHref, DEFAULT_HERO.secondaryHref),
    secondaryNewTab: heroBool(
      source.secondaryNewTab,
      isExternalHref(
        heroString(source.secondaryHref, DEFAULT_HERO.secondaryHref),
      ),
    ),
    secondaryNofollow: heroBool(
      source.secondaryNofollow,
      DEFAULT_HERO.secondaryNofollow,
    ),
    buttonOrder: normalizeHeroButtonOrder(
      source,
      heroString(source.primaryLabel, DEFAULT_HERO.primaryLabel),
      heroString(source.secondaryLabel, DEFAULT_HERO.secondaryLabel),
    ),
    tagline: heroString(source.tagline, DEFAULT_HERO.tagline),
    badge: heroString(source.badge, DEFAULT_HERO.badge),
    panelText: heroString(source.panelText, DEFAULT_HERO.panelText),
    stats,
    surface: normalizeHeroSurface(source.surface),
    showPanel: heroBool(source.showPanel, DEFAULT_HERO.showPanel),
    highlights:
      highlights.length > 0 ? highlights : [...DEFAULT_HERO.highlights],
    imageSrc: heroString(source.imageSrc, DEFAULT_HERO.imageSrc),
    imageAlt: heroString(source.imageAlt, DEFAULT_HERO.imageAlt),
    imageCaptionTitle: heroString(
      source.imageCaptionTitle,
      DEFAULT_HERO.imageCaptionTitle,
    ),
    imageCaptionBody: heroString(
      source.imageCaptionBody,
      DEFAULT_HERO.imageCaptionBody,
    ),
    audienceLabel: heroString(source.audienceLabel, DEFAULT_HERO.audienceLabel),
    audienceItems:
      audienceItems.length > 0
        ? audienceItems
        : [...DEFAULT_HERO.audienceItems],
    schoolsNote: heroString(source.schoolsNote, DEFAULT_HERO.schoolsNote),
    schoolsLink: heroString(source.schoolsLink, DEFAULT_HERO.schoolsLink),
    schoolsHref: heroString(source.schoolsHref, DEFAULT_HERO.schoolsHref),
  };
}

/* -------------------------------------------------------------------------- */
/* Lexical document helpers                                                    */
/* -------------------------------------------------------------------------- */

import {
  CONTACT_SECTION_NODE_TYPE,
  CTA_SECTION_NODE_TYPE,
  normalizeContactSectionData,
  normalizeCtaSectionData,
  normalizeReviewsSectionData,
  normalizeServicesSectionData,
  normalizeWhySectionData,
  normalizeWorkSectionData,
  REVIEWS_SECTION_NODE_TYPE,
  SERVICES_SECTION_NODE_TYPE,
  WHY_SECTION_NODE_TYPE,
  WORK_SECTION_NODE_TYPE,
} from "@/lib/cms/homepage-sections";

export const HERO_NODE_TYPE = "hero-section";

export {
  CONTACT_SECTION_NODE_TYPE,
  CTA_SECTION_NODE_TYPE,
  DEFAULT_CONTACT_SECTION,
  DEFAULT_CONTACT_PAGE_SECTION,
  DEFAULT_CTA_SECTION,
  DEFAULT_REVIEWS_SECTION,
  DEFAULT_SERVICES_SECTION,
  DEFAULT_WHY_SECTION,
  DEFAULT_WORK_SECTION,
  DEFAULT_PROJECTS_SECTION,
  HOMEPAGE_BLOCK_NODE_TYPES,
  normalizeContactSectionData,
  normalizeCtaSectionData,
  normalizeReviewsSectionData,
  normalizeServicesSectionData,
  normalizeWhySectionData,
  normalizeWorkSectionData,
  REVIEWS_SECTION_NODE_TYPE,
  SERVICES_SECTION_NODE_TYPE,
  WHY_SECTION_NODE_TYPE,
  WORK_SECTION_NODE_TYPE,
  type ContactSectionData,
  type CtaSectionData,
  type ReviewsSectionData,
  type ServicesSectionData,
  type WhySectionData,
  type WorkSectionData,
} from "@/lib/cms/homepage-sections";

export {
  createServiceOffering,
  createServiceOfferingsSectionData,
  DEFAULT_BLOG_PAGE_HEADER_SECTION,
  DEFAULT_BLOG_SECTION,
  DEFAULT_FAQ_SECTION,
  DEFAULT_PRIVACY_DOCUMENT_SECTION,
  DEFAULT_TERMS_DOCUMENT_SECTION,
  DEFAULT_ENGAGEMENT_MODELS_SECTION,
  DEFAULT_FEATURE_GRID_FEATURES,
  DEFAULT_FEATURE_GRID_SECTION,
  DEFAULT_PAGE_HEADER_SECTION,
  DEFAULT_PAGE_INTRO_SECTION,
  DEFAULT_SERVICE_OFFERINGS_SECTION,
  DEFAULT_STEPS_SECTION,
  DEFAULT_TEAM_SECTION,
  BLOG_SECTION_NODE_TYPE,
  FAQ_SECTION_NODE_TYPE,
  LEGAL_DOCUMENT_SECTION_NODE_TYPE,
  ENGAGEMENT_MODELS_SECTION_NODE_TYPE,
  FEATURE_GRID_SECTION_NODE_TYPE,
  normalizeBlogSectionData,
  normalizeFaqSectionData,
  normalizeLegalDocumentSectionData,
  normalizeEngagementModelsSectionData,
  normalizeFeatureGridSectionData,
  normalizePageHeaderSectionData,
  normalizePageIntroSectionData,
  normalizeServiceOfferingsSectionData,
  normalizeStepsSectionData,
  normalizeTeamSectionData,
  PAGE_HEADER_SECTION_NODE_TYPE,
  PAGE_INTRO_SECTION_NODE_TYPE,
  SERVICE_OFFERINGS_SECTION_NODE_TYPE,
  SITE_PAGE_BLOCK_NODE_TYPES,
  STEPS_SECTION_NODE_TYPE,
  TEAM_SECTION_NODE_TYPE,
  type BlogSectionData,
  type FaqSectionData,
  type LegalDocumentSectionData,
  type EngagementCard,
  type EngagementModelsSectionData,
  type FeatureGridSectionData,
  type PageHeaderLink,
  type PageHeaderSectionData,
  type PageIntroSectionData,
  type ServiceOffering,
  type ServiceOfferingTool,
  type ServiceOfferingsSectionData,
  type StepsSectionData,
  type TeamSectionData,
} from "@/lib/cms/site-page-sections";

import {
  BLOG_SECTION_NODE_TYPE,
  ENGAGEMENT_MODELS_SECTION_NODE_TYPE,
  FAQ_SECTION_NODE_TYPE,
  FEATURE_GRID_SECTION_NODE_TYPE,
  LEGAL_DOCUMENT_SECTION_NODE_TYPE,
  PAGE_HEADER_SECTION_NODE_TYPE,
  PAGE_INTRO_SECTION_NODE_TYPE,
  SERVICE_OFFERINGS_SECTION_NODE_TYPE,
  STEPS_SECTION_NODE_TYPE,
  TEAM_SECTION_NODE_TYPE,
} from "@/lib/cms/site-page-sections";

import { NATIVE_SPEAK_MARKETING_BLOCK_TYPES } from "@/lib/cms/marketing-blocks";

/** All Native Speak marketing section decorators (public site + CMS). */
export const CONTENT_BLOCK_DECORATOR_TYPES = [
  HERO_NODE_TYPE,
  CTA_SECTION_NODE_TYPE,
  PAGE_HEADER_SECTION_NODE_TYPE,
  PAGE_INTRO_SECTION_NODE_TYPE,
  FEATURE_GRID_SECTION_NODE_TYPE,
  STEPS_SECTION_NODE_TYPE,
  BLOG_SECTION_NODE_TYPE,
  ...NATIVE_SPEAK_MARKETING_BLOCK_TYPES,
] as const;

/** Minimal structural shape of a serialized Lexical node. */
export type ContentNode = {
  type: string;
  text?: string;
  children?: ContentNode[];
  data?: unknown;
  [key: string]: unknown;
};

export type ContentDocument = {
  root: ContentNode;
};

export const EMPTY_CONTENT_DOCUMENT: ContentDocument = {
  root: {
    type: "root",
    version: 1,
    direction: null,
    format: "",
    indent: 0,
    children: [
      {
        type: "paragraph",
        version: 1,
        direction: null,
        format: "",
        indent: 0,
        children: [],
      },
    ],
  },
};

export function emptyContentDocument(): ContentDocument {
  return JSON.parse(JSON.stringify(EMPTY_CONTENT_DOCUMENT)) as ContentDocument;
}

function isContentNode(value: unknown): value is ContentNode {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

/**
 * Block decorators (the hero) must be root children. Older saves may have
 * nested them inside a paragraph, so lift them out while parsing.
 */
function liftNestedBlocks(children: ContentNode[]): ContentNode[] {
  const result: ContentNode[] = [];
  const blockTypes = new Set<string>([...CONTENT_BLOCK_DECORATOR_TYPES]);

  for (const child of children) {
    if (child.type === "paragraph" && Array.isArray(child.children)) {
      const nestedBlocks = child.children.filter((grandchild) =>
        blockTypes.has(grandchild.type),
      );

      if (nestedBlocks.length > 0) {
        const inline = child.children.filter(
          (grandchild) => !blockTypes.has(grandchild.type),
        );
        const hasInlineContent = inline.some((grandchild) =>
          typeof grandchild.text === "string"
            ? grandchild.text.trim().length > 0
            : grandchild.type !== "text",
        );

        if (hasInlineContent) result.push({ ...child, children: inline });
        result.push(...nestedBlocks);
        continue;
      }
    }

    result.push(child);
  }

  return result;
}

/** Validate (and lightly repair) a serialized editor state from the client. */
export function parseContentDocument(value: unknown): ContentDocument | null {
  if (typeof value === "string") {
    try {
      return parseContentDocument(JSON.parse(value));
    } catch {
      return null;
    }
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const root = (value as { root?: unknown }).root;
  if (!isContentNode(root) || root.type !== "root") return null;

  const children = Array.isArray(root.children) ? root.children : [];
  const cleaned = liftNestedBlocks(children.filter(isContentNode));

  return {
    root: {
      ...root,
      children:
        cleaned.length > 0 ? cleaned : EMPTY_CONTENT_DOCUMENT.root.children,
    },
  };
}

function collectPlainText(node: ContentNode, parts: string[]): void {
  if (typeof node.text === "string") parts.push(node.text);

  if (node.type === HERO_NODE_TYPE) {
    const hero = normalizeHeroData(node.data);
    parts.push(
      hero.eyebrow,
      hero.headline,
      hero.description,
      hero.tagline,
      hero.badge,
      hero.panelText,
      hero.primaryLabel,
      hero.secondaryLabel,
      ...hero.stats.flatMap((stat) => [stat.value, stat.label]),
    );
  }

  if (node.type === SERVICES_SECTION_NODE_TYPE) {
    const section = normalizeServicesSectionData(node.data);
    parts.push(section.eyebrow, section.headline, section.description);
  }

  if (node.type === WORK_SECTION_NODE_TYPE) {
    const section = normalizeWorkSectionData(node.data);
    parts.push(
      section.eyebrow,
      section.headline,
      section.description,
      section.ctaLabel,
    );
  }

  if (node.type === REVIEWS_SECTION_NODE_TYPE) {
    const section = normalizeReviewsSectionData(node.data);
    parts.push(
      section.eyebrow,
      section.headline,
      section.description,
      section.emptyHeadline,
    );
  }

  if (node.type === WHY_SECTION_NODE_TYPE) {
    const section = normalizeWhySectionData(node.data);
    parts.push(
      section.eyebrow,
      section.headline,
      section.description,
      section.linkLabel,
      ...section.features.flatMap((f) => [f.title, f.summary]),
    );
  }

  if (node.type === CONTACT_SECTION_NODE_TYPE) {
    const section = normalizeContactSectionData(node.data);
    parts.push(
      section.eyebrow,
      section.headline,
      section.description,
      section.faqLabel,
    );
  }

  if (node.type === CTA_SECTION_NODE_TYPE) {
    const section = normalizeCtaSectionData(node.data);
    parts.push(
      section.headline,
      section.description,
      section.buttonLabel,
      section.email,
      section.responseNote,
    );
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (isContentNode(child)) collectPlainText(child, parts);
    }
  }
}

export function contentPlainText(document: ContentDocument): string {
  const parts: string[] = [];
  collectPlainText(document.root, parts);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function contentWordCount(document: ContentDocument): number {
  const text = contentPlainText(document);
  return text ? text.split(" ").length : 0;
}

/** Rough reading time at ~200 words per minute (minimum one minute). */
export function contentReadingTime(document: ContentDocument): number {
  return Math.max(1, Math.ceil(contentWordCount(document) / 200));
}

/** True when the entry starts with a hero block (optionally nested in a paragraph). */
export function contentStartsWithHero(document: ContentDocument): boolean {
  const children = document.root.children ?? [];

  for (const first of children) {
    // Ignore leading empty paragraphs left behind by the editor.
    if (
      first.type === "paragraph" &&
      Array.isArray(first.children) &&
      first.children.every(
        (child) =>
          child.type !== HERO_NODE_TYPE &&
          (typeof child.text !== "string" || child.text.trim().length === 0),
      )
    ) {
      continue;
    }

    if (first.type === HERO_NODE_TYPE) return true;

    return (
      first.type === "paragraph" &&
      Array.isArray(first.children) &&
      first.children.some((child) => child.type === HERO_NODE_TYPE)
    );
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Slugs & routes                                                              */
/* -------------------------------------------------------------------------- */

/** @deprecated Use `entryIsHomepage`. */
export function isHomepageCmsSlug(slug: string): boolean {
  return slug === HOMEPAGE_CMS_SLUG;
}

export function contentHref(
  kind: ContentKindName,
  slug: string,
  isHomepage = false,
): string {
  return contentPublicPath(kind, slug, isHomepage);
}

/** Public URL prefix shown beside the slug field in the studio. */
export function contentSlugPrefix(kind: ContentKindName): string {
  return kind === "post" ? "/blog/" : "/";
}

/** Pages at `/{slug}` (homepage at `/`); posts at `/blog/{slug}`. */
export function contentPublicPath(
  kind: ContentKindName,
  slug: string,
  isHomepage = false,
): string {
  if (kind === "post") return `/blog/${slug}`;
  if (isHomepage) return "/";
  return `/${slug}`;
}

export function contentDocumentUsesBlockType(
  document: ContentDocument,
  blockType: string,
): boolean {
  const walk = (nodes: ContentNode[] | undefined): boolean => {
    if (!nodes) return false;
    for (const node of nodes) {
      if (node.type === blockType) return true;
      if (node.children && walk(node.children)) return true;
    }
    return false;
  };
  return walk(document.root.children);
}

const CONTENT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatContentDate(value: Date | string | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return CONTENT_DATE_FORMATTER.format(date);
}

const CONTENT_ERRORS: Record<string, string> = {
  kind: "Choose a valid content type.",
  title: "Add a title before saving.",
  slug: "Add a valid slug before saving.",
  status: "Choose a valid status.",
  body: "The editor content could not be read. Try again.",
  duplicate: "Another entry of that type already uses this slug.",
  missing: "That entry no longer exists.",
  cover:
    "Could not upload the cover image. Try a smaller file or check UploadThing.",
};

export function contentErrorMessage(error?: string | null): string | null {
  if (!error) return null;
  return CONTENT_ERRORS[error] ?? "Could not save your changes.";
}
