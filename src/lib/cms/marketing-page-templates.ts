/**
 * Suggested block stacks per public route — insert in order when building CMS pages.
 */

import {
  PRESET_FEATURE_GRID_CLASS_INCLUDES,
  PRESET_FEATURE_GRID_PROGRESS,
  PRESET_PAGE_HEADERS,
} from "@/lib/cms/marketing-blocks";
import type { InsertContentBlockId } from "@/components/cms-lexical/insert-content-block-types";

export type MarketingPageTemplate = {
  slug: string;
  title: string;
  blocks: InsertContentBlockId[];
};

export const MARKETING_PAGE_TEMPLATES: MarketingPageTemplate[] = [
  {
    slug: "home",
    title: "Home",
    blocks: [
      "hero",
      "steps",
      "programs-showcase",
      "progress",
    ],
  },
  {
    slug: "how-it-works",
    title: "How it works",
    blocks: [
      "page-header",
      "onboarding-trio",
      "feature-grid",
      "feature-grid",
      "bullet-list",
      "faq",
      "dual-cta",
    ],
  },
  {
    slug: "about",
    title: "About",
    blocks: ["page-header", "page-intro"],
  },
  {
    slug: "pricing",
    title: "Pricing",
    blocks: ["page-header", "pricing-picker", "testimonials"],
  },
  {
    slug: "schools",
    title: "Schools",
    blocks: ["page-header", "bullet-cta"],
  },
  {
    slug: "free-class",
    title: "Free class",
    blocks: ["page-header", "lead-form"],
  },
  {
    slug: "programs",
    title: "Programs index",
    blocks: ["page-header", "programs-grid"],
  },
  {
    slug: "programs/preschool",
    title: "Program detail",
    blocks: ["page-header", "program-detail"],
  },
  {
    slug: "blog",
    title: "Blog",
    blocks: ["blog-header", "blog"],
  },
];

/** Notes for editors when seeding headers / duplicate feature grids. */
export const MARKETING_PAGE_TEMPLATE_NOTES: Record<string, string> = {
  "how-it-works":
    "Use page-header preset How it works. First feature-grid = class includes; second = prove progress (edit titles in block options).",
  about: "Page hero preset: Our story. Page intro = pillars + image.",
  pricing: "Page hero preset: Pricing.",
  schools: "Page hero preset: Schools.",
  "free-class": "Page hero preset: Free trial.",
  programs: "Page hero preset: Programs.",
};

export { PRESET_PAGE_HEADERS, PRESET_FEATURE_GRID_CLASS_INCLUDES, PRESET_FEATURE_GRID_PROGRESS };
