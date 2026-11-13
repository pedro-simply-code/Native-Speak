"use client";

import { $applyNodeReplacement } from "lexical";
import type { InsertContentBlockId } from "@/components/cms-lexical/insert-content-block-types";
import { BlogSectionNode } from "@/components/cms-lexical/blog-node";
import { CtaSectionNode } from "@/components/cms-lexical/cta-node";
import { FeatureGridSectionNode } from "@/components/cms-lexical/feature-grid-node";
import { HeroNode } from "@/components/cms-lexical/hero-node";
import {
  blogHeaderSectionNode,
  bulletCtaSectionNode,
  bulletListSectionNode,
  dualCtaSectionNode,
  faqMarketingSectionNode,
  leadFormSectionNode,
  onboardingTrioSectionNode,
  pricingPickerSectionNode,
  programDetailSectionNode,
  programsGridSectionNode,
  programsShowcaseSectionNode,
  progressMarketingSectionNode,
  testimonialsSectionNode,
} from "@/components/cms-lexical/marketing-block-nodes";
import { PageHeaderSectionNode } from "@/components/cms-lexical/page-header-node";
import { PageIntroSectionNode } from "@/components/cms-lexical/page-intro-node";
import { StepsSectionNode } from "@/components/cms-lexical/steps-node";
import {
  DEFAULT_BLOG_SECTION,
  DEFAULT_CTA_SECTION,
  DEFAULT_FEATURE_GRID_SECTION,
  DEFAULT_HERO,
  DEFAULT_PAGE_HEADER_SECTION,
  DEFAULT_PAGE_INTRO_SECTION,
  DEFAULT_STEPS_SECTION,
  type BlogSectionData,
  type CtaSectionData,
  type HeroData,
} from "@/lib/cms/content";
import type {
  FeatureGridSectionData,
  PageHeaderSectionData,
  PageIntroSectionData,
  StepsSectionData,
} from "@/lib/cms/site-page-sections";

export function createHeroNode(data: HeroData = DEFAULT_HERO) {
  return $applyNodeReplacement(new HeroNode(data));
}

export function createCtaSectionNode(data: CtaSectionData = DEFAULT_CTA_SECTION) {
  return $applyNodeReplacement(new CtaSectionNode(data));
}

export function createPageHeaderSectionNode(
  data: PageHeaderSectionData = DEFAULT_PAGE_HEADER_SECTION,
) {
  return $applyNodeReplacement(new PageHeaderSectionNode(data));
}

export function createPageIntroSectionNode(
  data: PageIntroSectionData = DEFAULT_PAGE_INTRO_SECTION,
) {
  return $applyNodeReplacement(new PageIntroSectionNode(data));
}

export function createFeatureGridSectionNode(
  data: FeatureGridSectionData = DEFAULT_FEATURE_GRID_SECTION,
) {
  return $applyNodeReplacement(new FeatureGridSectionNode(data));
}

export function createStepsSectionNode(
  data: StepsSectionData = DEFAULT_STEPS_SECTION,
) {
  return $applyNodeReplacement(new StepsSectionNode(data));
}

export function createBlogSectionNode(data: BlogSectionData = DEFAULT_BLOG_SECTION) {
  return $applyNodeReplacement(new BlogSectionNode(data));
}

const MARKETING_CREATORS: Record<
  Exclude<
    InsertContentBlockId,
    | "paragraph"
    | "h1"
    | "h2"
    | "h3"
    | "quote"
    | "hero"
    | "cta"
    | "page-header"
    | "page-intro"
    | "feature-grid"
    | "steps"
    | "blog"
  >,
  () => ReturnType<typeof $applyNodeReplacement>
> = {
  "onboarding-trio": () => onboardingTrioSectionNode.create(),
  "bullet-list": () => bulletListSectionNode.create(),
  "bullet-cta": () => bulletCtaSectionNode.create(),
  faq: () => faqMarketingSectionNode.create(),
  "dual-cta": () => dualCtaSectionNode.create(),
  testimonials: () => testimonialsSectionNode.create(),
  "lead-form": () => leadFormSectionNode.create(),
  "pricing-picker": () => pricingPickerSectionNode.create(),
  progress: () => progressMarketingSectionNode.create(),
  "programs-showcase": () => programsShowcaseSectionNode.create(),
  "programs-grid": () => programsGridSectionNode.create(),
  "program-detail": () => programDetailSectionNode.create(),
  "blog-header": () => blogHeaderSectionNode.create(),
};

export function createMarketingBlock(id: InsertContentBlockId) {
  const create = MARKETING_CREATORS[id as keyof typeof MARKETING_CREATORS];
  if (!create) {
    throw new Error(`Unknown marketing block: ${id}`);
  }
  return create();
}
