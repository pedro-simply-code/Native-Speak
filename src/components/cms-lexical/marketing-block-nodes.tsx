"use client";

import {
  BlogHeaderSection,
  BulletCtaSection,
  BulletListSection,
  DualCtaSection,
  FaqMarketingSection,
  LeadFormSection,
  OnboardingTrioSection,
  PricingPickerSection,
  ProgramDetailSection,
  ProgramsGridSection,
  ProgramsShowcaseSection,
  ProgressMarketingSection,
  TestimonialsSection,
} from "@/components/cms-content/marketing-sections";
import { defineSectionNode } from "@/components/cms-lexical/define-section-node";
import {
  BLOG_HEADER_SECTION_NODE_TYPE,
  BULLET_CTA_SECTION_NODE_TYPE,
  BULLET_LIST_SECTION_NODE_TYPE,
  DEFAULT_BLOG_HEADER_SECTION,
  DEFAULT_BULLET_CTA_SECTION,
  DEFAULT_BULLET_LIST_SECTION,
  DEFAULT_DUAL_CTA_SECTION,
  DEFAULT_FAQ_SECTION,
  DEFAULT_LEAD_FORM_SECTION,
  DEFAULT_ONBOARDING_TRIO_SECTION,
  DEFAULT_PRICING_PICKER_SECTION,
  DEFAULT_PROGRAM_DETAIL_SECTION,
  DEFAULT_PROGRAMS_GRID_SECTION,
  DEFAULT_PROGRAMS_SHOWCASE_SECTION,
  DEFAULT_PROGRESS_SECTION,
  DEFAULT_TESTIMONIALS_SECTION,
  DUAL_CTA_SECTION_NODE_TYPE,
  FAQ_SECTION_NODE_TYPE,
  LEAD_FORM_SECTION_NODE_TYPE,
  ONBOARDING_TRIO_SECTION_NODE_TYPE,
  PRICING_PICKER_SECTION_NODE_TYPE,
  PROGRAM_DETAIL_SECTION_NODE_TYPE,
  PROGRAMS_GRID_SECTION_NODE_TYPE,
  PROGRAMS_SHOWCASE_SECTION_NODE_TYPE,
  PROGRESS_SECTION_NODE_TYPE,
  TESTIMONIALS_SECTION_NODE_TYPE,
  normalizeBlogHeaderSectionData,
  normalizeBulletCtaSectionData,
  normalizeBulletListSectionData,
  normalizeDualCtaSectionData,
  normalizeFaqSectionData,
  normalizeLeadFormSectionData,
  normalizeOnboardingTrioSectionData,
  normalizePricingPickerSectionData,
  normalizeProgramDetailSectionData,
  normalizeProgramsGridSectionData,
  normalizeProgramsShowcaseSectionData,
  normalizeProgressSectionData,
  normalizeTestimonialsSectionData,
  type PricingPickerSectionData,
} from "@/lib/cms/marketing-blocks";

export const onboardingTrioSectionNode = defineSectionNode({
  type: ONBOARDING_TRIO_SECTION_NODE_TYPE,
  label: "Onboarding trio",
  blockId: "onboarding-trio",
  defaultData: DEFAULT_ONBOARDING_TRIO_SECTION,
  normalize: normalizeOnboardingTrioSectionData,
  Component: OnboardingTrioSection,
});

export const bulletListSectionNode = defineSectionNode({
  type: BULLET_LIST_SECTION_NODE_TYPE,
  label: "Bullet list",
  blockId: "bullet-list",
  defaultData: DEFAULT_BULLET_LIST_SECTION,
  normalize: normalizeBulletListSectionData,
  Component: BulletListSection,
});

export const bulletCtaSectionNode = defineSectionNode({
  type: BULLET_CTA_SECTION_NODE_TYPE,
  label: "Bullets + CTA",
  blockId: "bullet-cta",
  defaultData: DEFAULT_BULLET_CTA_SECTION,
  normalize: normalizeBulletCtaSectionData,
  Component: BulletCtaSection,
});

export const faqMarketingSectionNode = defineSectionNode({
  type: FAQ_SECTION_NODE_TYPE,
  label: "FAQ",
  blockId: "faq",
  defaultData: DEFAULT_FAQ_SECTION,
  normalize: normalizeFaqSectionData,
  Component: FaqMarketingSection,
});

export const dualCtaSectionNode = defineSectionNode({
  type: DUAL_CTA_SECTION_NODE_TYPE,
  label: "Dual CTA",
  blockId: "dual-cta",
  defaultData: DEFAULT_DUAL_CTA_SECTION,
  normalize: normalizeDualCtaSectionData,
  Component: DualCtaSection,
});

export const testimonialsSectionNode = defineSectionNode({
  type: TESTIMONIALS_SECTION_NODE_TYPE,
  label: "Testimonials",
  blockId: "testimonials",
  defaultData: DEFAULT_TESTIMONIALS_SECTION,
  normalize: normalizeTestimonialsSectionData,
  Component: TestimonialsSection,
});

export const leadFormSectionNode = defineSectionNode({
  type: LEAD_FORM_SECTION_NODE_TYPE,
  label: "Lead form",
  blockId: "lead-form",
  defaultData: DEFAULT_LEAD_FORM_SECTION,
  normalize: normalizeLeadFormSectionData,
  Component: LeadFormSection,
});

const PricingPickerWrap = (_props: { data: PricingPickerSectionData }) => (
  <PricingPickerSection />
);

export const pricingPickerSectionNode = defineSectionNode({
  type: PRICING_PICKER_SECTION_NODE_TYPE,
  label: "Pricing picker",
  blockId: "pricing-picker",
  defaultData: DEFAULT_PRICING_PICKER_SECTION,
  normalize: normalizePricingPickerSectionData,
  Component: PricingPickerWrap,
});

export const progressMarketingSectionNode = defineSectionNode({
  type: PROGRESS_SECTION_NODE_TYPE,
  label: "Expectations",
  blockId: "progress",
  defaultData: DEFAULT_PROGRESS_SECTION,
  normalize: normalizeProgressSectionData,
  Component: ProgressMarketingSection,
});

export const programsShowcaseSectionNode = defineSectionNode({
  type: PROGRAMS_SHOWCASE_SECTION_NODE_TYPE,
  label: "Programs tabs",
  blockId: "programs-showcase",
  defaultData: DEFAULT_PROGRAMS_SHOWCASE_SECTION,
  normalize: normalizeProgramsShowcaseSectionData,
  Component: ProgramsShowcaseSection,
});

export const programsGridSectionNode = defineSectionNode({
  type: PROGRAMS_GRID_SECTION_NODE_TYPE,
  label: "Programs grid",
  blockId: "programs-grid",
  defaultData: DEFAULT_PROGRAMS_GRID_SECTION,
  normalize: normalizeProgramsGridSectionData,
  Component: ProgramsGridSection,
});

export const programDetailSectionNode = defineSectionNode({
  type: PROGRAM_DETAIL_SECTION_NODE_TYPE,
  label: "Program detail",
  blockId: "program-detail",
  defaultData: DEFAULT_PROGRAM_DETAIL_SECTION,
  normalize: normalizeProgramDetailSectionData,
  Component: ProgramDetailSection,
});

export const blogHeaderSectionNode = defineSectionNode({
  type: BLOG_HEADER_SECTION_NODE_TYPE,
  label: "Blog header",
  blockId: "blog-header",
  defaultData: DEFAULT_BLOG_HEADER_SECTION,
  normalize: normalizeBlogHeaderSectionData,
  Component: BlogHeaderSection,
});

export const MARKETING_SECTION_NODE_CLASSES = [
  onboardingTrioSectionNode.Node,
  bulletListSectionNode.Node,
  bulletCtaSectionNode.Node,
  faqMarketingSectionNode.Node,
  dualCtaSectionNode.Node,
  testimonialsSectionNode.Node,
  leadFormSectionNode.Node,
  pricingPickerSectionNode.Node,
  progressMarketingSectionNode.Node,
  programsShowcaseSectionNode.Node,
  programsGridSectionNode.Node,
  programDetailSectionNode.Node,
  blogHeaderSectionNode.Node,
] as const;

export const MARKETING_SECTION_DECORATOR_TYPES = [
  onboardingTrioSectionNode.type,
  bulletListSectionNode.type,
  bulletCtaSectionNode.type,
  faqMarketingSectionNode.type,
  dualCtaSectionNode.type,
  testimonialsSectionNode.type,
  leadFormSectionNode.type,
  pricingPickerSectionNode.type,
  progressMarketingSectionNode.type,
  programsShowcaseSectionNode.type,
  programsGridSectionNode.type,
  programDetailSectionNode.type,
  blogHeaderSectionNode.type,
] as const;
