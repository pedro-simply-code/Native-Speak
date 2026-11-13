import Link from "next/link";
import type { ReactNode } from "react";
import { BlogPostsSection } from "@/components/cms-content/blog-posts-section";
import { CtaMarketingSection } from "@/components/cms-content/cta-marketing-section";
import { FeatureGridSection } from "@/components/cms-content/feature-grid-section";
import { HeroSection } from "@/components/cms-content/hero-section";
import { PageHeaderSection } from "@/components/cms-content/page-header-section";
import { PageIntroSection } from "@/components/cms-content/page-intro-section";
import { StepsSection } from "@/components/cms-content/steps-section";
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
import type { TeamMember } from "@/cms-seed-content/team";
import type { Project } from "@/cms-seed-content/projects";
import {
  CONTENT_BLOCK_DECORATOR_TYPES,
  CTA_SECTION_NODE_TYPE,
  HERO_NODE_TYPE,
  normalizeCtaSectionData,
  normalizeHeroData,
  normalizePageHeaderSectionData,
  normalizePageIntroSectionData,
  normalizeFeatureGridSectionData,
  normalizeStepsSectionData,
  normalizeBlogSectionData,
  PAGE_HEADER_SECTION_NODE_TYPE,
  PAGE_INTRO_SECTION_NODE_TYPE,
  FEATURE_GRID_SECTION_NODE_TYPE,
  BLOG_SECTION_NODE_TYPE,
  STEPS_SECTION_NODE_TYPE,
  type ContentDocument,
  type ContentNode,
} from "@/lib/cms/content";
import {
  BLOG_HEADER_SECTION_NODE_TYPE,
  BULLET_CTA_SECTION_NODE_TYPE,
  BULLET_LIST_SECTION_NODE_TYPE,
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
  normalizeProgramDetailSectionData,
  normalizeProgramsGridSectionData,
  normalizeProgramsShowcaseSectionData,
  normalizeProgressSectionData,
  normalizeTestimonialsSectionData,
} from "@/lib/cms/marketing-blocks";
import { isExternalHref } from "@/lib/cms/link-options";
import { QUOTE_INNER_TYPE } from "@/components/cms-lexical/quote-inner-node";
import { QUOTE_WRAP_NODE_TYPE } from "@/components/cms-lexical/quote-wrap-node";
import { appQuoteInner, appQuoteOuter, appQuotePageWrap } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_UNDERLINE = 8;
const FORMAT_CODE = 16;
const FORMAT_SUBSCRIPT = 32;
const FORMAT_SUPERSCRIPT = 64;
const FORMAT_HIGHLIGHT = 128;

import type { PublicContentSummary } from "@/server/content/queries";

type RenderContext = {
  teamMembers: TeamMember[];
  teamFromStudio: boolean;
  workProjects: Project[];
  blogPosts: PublicContentSummary[];
};

const EMPTY_RENDER_CONTEXT: RenderContext = {
  teamMembers: [],
  teamFromStudio: false,
  workProjects: [],
  blogPosts: [],
};

function renderText(node: ContentNode, key: string): ReactNode {
  const text = typeof node.text === "string" ? node.text : "";
  if (!text) return null;

  const format = typeof node.format === "number" ? node.format : 0;
  let content: ReactNode = text;

  if (format & FORMAT_CODE) {
    content = (
      <code className="rounded bg-[#15130f]/5 px-1 py-0.5 font-mono text-[0.9em]">
        {content}
      </code>
    );
  }
  if (format & FORMAT_HIGHLIGHT) {
    content = <mark className="bg-yellow-200/70 px-0.5">{content}</mark>;
  }
  if (format & FORMAT_SUPERSCRIPT) content = <sup>{content}</sup>;
  if (format & FORMAT_SUBSCRIPT) content = <sub>{content}</sub>;
  if (format & FORMAT_UNDERLINE) content = <u>{content}</u>;
  if (format & FORMAT_STRIKETHROUGH) content = <s>{content}</s>;
  if (format & FORMAT_ITALIC) content = <em>{content}</em>;
  if (format & FORMAT_BOLD) content = <strong>{content}</strong>;

  return <span key={key}>{content}</span>;
}

function renderChildren(
  children: ContentNode[] | undefined,
  prefix: string,
  context: RenderContext = EMPTY_RENDER_CONTEXT,
): ReactNode[] {
  if (!children) return [];
  return children.map((child, index) =>
    renderNode(child, `${prefix}-${index}`, context),
  );
}

function HeadingBlock({
  node,
  keyName,
}: {
  node: ContentNode;
  keyName: string;
}) {
  const tag = node.tag === "h1" ? "h1" : node.tag === "h3" ? "h3" : "h2";
  const className =
    tag === "h1"
      ? "mt-12 mb-5 text-[clamp(2rem,4vw,3.2rem)] leading-[1.04] font-black tracking-[-0.03em] uppercase"
      : tag === "h3"
        ? "mt-8 mb-3 text-[1.35rem] leading-tight font-black tracking-[-0.02em]"
        : "mt-12 mb-4 text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.08] font-black tracking-[-0.03em] uppercase";
  const content = renderChildren(node.children, keyName);

  if (tag === "h1")
    return (
      <h1 key={keyName} className={className}>
        {content}
      </h1>
    );
  if (tag === "h3")
    return (
      <h3 key={keyName} className={className}>
        {content}
      </h3>
    );
  return (
    <h2 key={keyName} className={className}>
      {content}
    </h2>
  );
}

function ListBlock({ node, keyName }: { node: ContentNode; keyName: string }) {
  const ordered = node.listType === "number" || node.tag === "ol";
  const className = cn(
    "mb-5 space-y-1.5 pl-6 text-[16px] leading-[1.75] text-[#3f3b34]",
    ordered ? "list-decimal" : "list-disc",
  );
  const content = renderChildren(node.children, keyName);

  return ordered ? (
    <ol key={keyName} className={className}>
      {content}
    </ol>
  ) : (
    <ul key={keyName} className={className}>
      {content}
    </ul>
  );
}

function LinkBlock({ node, keyName }: { node: ContentNode; keyName: string }) {
  const href = typeof node.url === "string" ? node.url : "";
  const content = renderChildren(node.children, keyName);
  const className = "text-sc-accent underline underline-offset-2";
  const target =
    typeof node.target === "string" && node.target.trim()
      ? node.target
      : undefined;
  const rel =
    typeof node.rel === "string" && node.rel.trim() ? node.rel : undefined;
  const newTab = target === "_blank";

  if (!href) return <span key={keyName}>{content}</span>;

  const external = isExternalHref(href);
  if (external) {
    return (
      <a
        key={keyName}
        href={href}
        className={className}
        rel={rel}
        target={newTab ? "_blank" : undefined}
      >
        {content}
      </a>
    );
  }

  if (newTab) {
    return (
      <Link
        key={keyName}
        href={href}
        className={className}
        rel={rel}
        target="_blank"
      >
        {content}
      </Link>
    );
  }

  return (
    <Link key={keyName} href={href} className={className} rel={rel}>
      {content}
    </Link>
  );
}

function renderQuoteBlockquote(node: ContentNode, keyName: string): ReactNode {
  const inner = node.children?.find((child) => child.type === QUOTE_INNER_TYPE);
  const content = inner?.children ?? node.children ?? [];
  return (
    <blockquote key={keyName} className={cn(appQuoteOuter, appQuoteInner)}>
      {renderChildren(content, keyName)}
    </blockquote>
  );
}

function renderQuoteRootBlock(node: ContentNode, keyName: string): ReactNode {
  const quote =
    node.type === QUOTE_WRAP_NODE_TYPE
      ? node.children?.find((child) => child.type === "quote")
      : node.type === "quote"
        ? node
        : undefined;

  if (!quote) return null;

  return (
    <div key={`${keyName}-wrap`} className={appQuotePageWrap}>
      {renderQuoteBlockquote(quote, keyName)}
    </div>
  );
}

const CONTENT_BLOCK_WRAP = "mx-auto w-full max-w-[1400px] px-6";

function hasVisibleInlineContent(children: ContentNode[]): boolean {
  return children.some((child) =>
    typeof child.text === "string"
      ? child.text.trim().length > 0
      : child.type !== "text",
  );
}

function isFullBleedBlockType(type: string | undefined): boolean {
  return (
    type !== undefined &&
    (CONTENT_BLOCK_DECORATOR_TYPES as readonly string[]).includes(type)
  );
}

/**
 * Renders the root children: homepage section blocks stay full-bleed while
 * prose blocks use CONTENT_BLOCK_WRAP.
 */
function renderRoot(
  children: ContentNode[] | undefined,
  context: RenderContext,
): ReactNode[] {
  if (!children) return [];

  const nodes: ReactNode[] = [];
  let needsSpacingAfterFullBleed = false;

  children.forEach((child, index) => {
    const keyName = `root-${index}`;

    if (isFullBleedBlockType(child.type)) {
      nodes.push(renderNode(child, keyName, context));
      needsSpacingAfterFullBleed = true;
      return;
    }

    if (child.type === "quote" || child.type === QUOTE_WRAP_NODE_TYPE) {
      const rendered = renderQuoteRootBlock(child, keyName);
      if (rendered) nodes.push(rendered);
      needsSpacingAfterFullBleed = false;
      return;
    }

    if (child.type === "paragraph" && Array.isArray(child.children)) {
      const decorators = child.children.filter((grandchild) =>
        isFullBleedBlockType(grandchild.type),
      );

      if (decorators.length > 0) {
        const inline = child.children.filter(
          (grandchild) => !isFullBleedBlockType(grandchild.type),
        );

        if (hasVisibleInlineContent(inline)) {
          nodes.push(
            <div
              key={`${keyName}-wrap`}
              className={cn(
                CONTENT_BLOCK_WRAP,
                needsSpacingAfterFullBleed && "pt-12",
              )}
            >
              {renderNode({ ...child, children: inline }, keyName, context)}
            </div>,
          );
          needsSpacingAfterFullBleed = false;
        }

        decorators.forEach((block, blockIndex) => {
          nodes.push(
            renderNode(block, `${keyName}-block-${blockIndex}`, context),
          );
        });
        needsSpacingAfterFullBleed = true;
        return;
      }
    }

    if (
      child.type === "paragraph" &&
      !hasVisibleInlineContent(child.children ?? [])
    ) {
      return;
    }

    nodes.push(
      <div
        key={`${keyName}-wrap`}
        className={cn(
          CONTENT_BLOCK_WRAP,
          needsSpacingAfterFullBleed && "pt-12",
        )}
      >
        {renderNode(child, keyName, context)}
      </div>,
    );
    needsSpacingAfterFullBleed = false;
  });

  return nodes;
}

function renderNode(
  node: ContentNode,
  keyName: string,
  context: RenderContext = EMPTY_RENDER_CONTEXT,
): ReactNode {
  const { teamMembers, teamFromStudio, workProjects, blogPosts } = context;

  switch (node.type) {
    case "text":
      return renderText(node, keyName);
    case "linebreak":
      return <br key={keyName} />;
    case "root":
      return <>{renderRoot(node.children, context)}</>;
    case "paragraph": {
      // Older saves (or pasted content) may nest the hero decorator inside a
      // paragraph, which is invalid HTML (`<section>` inside `<p>`). Render the
      // container as a `<div>` in that case.
      const hasBlockChild = node.children?.some(
        (child) =>
          isFullBleedBlockType(child.type) || child.type === "paragraph",
      );

      if (hasBlockChild) {
        return (
          <div key={keyName} className="whitespace-pre-wrap">
            {renderChildren(node.children, keyName, context)}
          </div>
        );
      }

      return (
        <p
          key={keyName}
          className="mb-5 text-[16px] leading-[1.8] whitespace-pre-wrap text-[#3f3b34]"
        >
          {renderChildren(node.children, keyName, context)}
        </p>
      );
    }
    case "heading":
      return <HeadingBlock key={keyName} node={node} keyName={keyName} />;
    case "quote":
      return renderQuoteBlockquote(node, keyName);
    case QUOTE_WRAP_NODE_TYPE:
      return renderQuoteRootBlock(node, keyName);
    case QUOTE_INNER_TYPE:
      return <>{renderChildren(node.children, keyName, context)}</>;
    case "list":
      return <ListBlock key={keyName} node={node} keyName={keyName} />;
    case "listitem":
      return (
        <li key={keyName}>{renderChildren(node.children, keyName, context)}</li>
      );
    case "link":
      return <LinkBlock key={keyName} node={node} keyName={keyName} />;
    case HERO_NODE_TYPE:
      return <HeroSection key={keyName} data={normalizeHeroData(node.data)} />;
    case CTA_SECTION_NODE_TYPE:
      return (
        <CtaMarketingSection
          key={keyName}
          data={normalizeCtaSectionData(node.data)}
        />
      );
    case PAGE_HEADER_SECTION_NODE_TYPE:
      return (
        <PageHeaderSection
          key={keyName}
          data={normalizePageHeaderSectionData(node.data)}
        />
      );
    case PAGE_INTRO_SECTION_NODE_TYPE:
      return (
        <PageIntroSection
          key={keyName}
          data={normalizePageIntroSectionData(node.data)}
        />
      );
    case FEATURE_GRID_SECTION_NODE_TYPE:
      return (
        <FeatureGridSection
          key={keyName}
          data={normalizeFeatureGridSectionData(node.data)}
        />
      );
    case STEPS_SECTION_NODE_TYPE:
      return (
        <StepsSection
          key={keyName}
          data={normalizeStepsSectionData(node.data)}
        />
      );
    case BLOG_SECTION_NODE_TYPE:
      return (
        <BlogPostsSection
          key={keyName}
          data={normalizeBlogSectionData(node.data)}
          posts={blogPosts}
        />
      );
    case ONBOARDING_TRIO_SECTION_NODE_TYPE:
      return (
        <OnboardingTrioSection
          key={keyName}
          data={normalizeOnboardingTrioSectionData(node.data)}
        />
      );
    case BULLET_LIST_SECTION_NODE_TYPE:
      return (
        <BulletListSection
          key={keyName}
          data={normalizeBulletListSectionData(node.data)}
        />
      );
    case BULLET_CTA_SECTION_NODE_TYPE:
      return (
        <BulletCtaSection
          key={keyName}
          data={normalizeBulletCtaSectionData(node.data)}
        />
      );
    case FAQ_SECTION_NODE_TYPE:
      return (
        <FaqMarketingSection
          key={keyName}
          data={normalizeFaqSectionData(node.data)}
        />
      );
    case DUAL_CTA_SECTION_NODE_TYPE:
      return (
        <DualCtaSection
          key={keyName}
          data={normalizeDualCtaSectionData(node.data)}
        />
      );
    case TESTIMONIALS_SECTION_NODE_TYPE:
      return (
        <TestimonialsSection
          key={keyName}
          data={normalizeTestimonialsSectionData(node.data)}
        />
      );
    case LEAD_FORM_SECTION_NODE_TYPE:
      return (
        <LeadFormSection
          key={keyName}
          data={normalizeLeadFormSectionData(node.data)}
        />
      );
    case PRICING_PICKER_SECTION_NODE_TYPE:
      return <PricingPickerSection key={keyName} />;
    case PROGRESS_SECTION_NODE_TYPE:
      return (
        <ProgressMarketingSection
          key={keyName}
          data={normalizeProgressSectionData(node.data)}
        />
      );
    case PROGRAMS_SHOWCASE_SECTION_NODE_TYPE:
      return (
        <ProgramsShowcaseSection
          key={keyName}
          data={normalizeProgramsShowcaseSectionData(node.data)}
        />
      );
    case PROGRAMS_GRID_SECTION_NODE_TYPE:
      return (
        <ProgramsGridSection
          key={keyName}
          data={normalizeProgramsGridSectionData(node.data)}
        />
      );
    case PROGRAM_DETAIL_SECTION_NODE_TYPE:
      return (
        <ProgramDetailSection
          key={keyName}
          data={normalizeProgramDetailSectionData(node.data)}
        />
      );
    case BLOG_HEADER_SECTION_NODE_TYPE:
      return (
        <BlogHeaderSection
          key={keyName}
          data={normalizeBlogHeaderSectionData(node.data)}
        />
      );
    default:
      return node.children ? (
        <div key={keyName}>
          {renderChildren(node.children, keyName, context)}
        </div>
      ) : null;
  }
}

/** Server-side Lexical JSON renderer. Never ships the editor to the client. */
export function ContentRenderer({
  document,
  className,
  teamMembers = [],
  teamFromStudio = false,
  workProjects = [],
  blogPosts = [],
}: {
  document: ContentDocument;
  className?: string;
  teamMembers?: TeamMember[];
  teamFromStudio?: boolean;
  workProjects?: Project[];
  blogPosts?: PublicContentSummary[];
}) {
  const context: RenderContext = {
    teamMembers,
    teamFromStudio,
    workProjects,
    blogPosts,
  };
  return (
    <div className={cn("content-body", className)}>
      {renderNode(document.root, "root", context)}
    </div>
  );
}
