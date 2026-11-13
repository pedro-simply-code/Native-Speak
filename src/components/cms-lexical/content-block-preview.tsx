"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BlogPostsSection } from "@/components/cms-content/blog-posts-section";
import { CtaMarketingSection } from "@/components/cms-content/cta-marketing-section";
import { FeatureGridSection } from "@/components/cms-content/feature-grid-section";
import { HeroSection } from "@/components/cms-content/hero-section";
import { PageHeaderSection } from "@/components/cms-content/page-header-section";
import { PageIntroSection } from "@/components/cms-content/page-intro-section";
import { StepsSection } from "@/components/cms-content/steps-section";
import type { PublicContentSummary } from "@/server/content/queries";
import { useContentEditorPosts } from "@/components/cms-lexical/content-editor-posts-context";
import type { InsertContentBlockId } from "@/components/cms-lexical/insert-content-block-types";
import {
  DEFAULT_BLOG_SECTION,
  DEFAULT_CTA_SECTION,
  DEFAULT_FEATURE_GRID_SECTION,
  DEFAULT_HERO,
  DEFAULT_PAGE_HEADER_SECTION,
  DEFAULT_PAGE_INTRO_SECTION,
  DEFAULT_STEPS_SECTION,
} from "@/lib/cms/content";
import { appQuoteInner, appQuoteOuter } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

const PREVIEW_CANVAS_WIDTH = 960;
const PREVIEW_VIEWPORT_HEIGHT = 112;

function ScaledPreviewFrame({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(width / PREVIEW_CANVAS_WIDTH);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Previews are portaled into <body>, so they would otherwise inherit the
  // app theme foreground (near-white in dark mode) on a white canvas. The site
  // ink token is theme-independent, so pin the text color at the frame.
  return (
    <div
      ref={hostRef}
      className="content-block-preview text-sc-ink relative mt-2 w-full overflow-hidden rounded-md border border-[#15130f]/10 bg-white shadow-[inset_0_0_0_1px_rgba(21,19,15,0.04)]"
      style={{ height: PREVIEW_VIEWPORT_HEIGHT }}
    >
      <div
        className="pointer-events-none absolute top-0 left-0 origin-top-left"
        style={{
          width: PREVIEW_CANVAS_WIDTH,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function TextBlockPreview({ blockId }: { blockId: InsertContentBlockId }) {
  if (blockId === "h1") {
    return (
      <ScaledPreviewFrame>
        <div className="bg-sc-section px-10 py-8">
          <h1 className="text-[clamp(1.9rem,3.4vw,2.8rem)] font-black tracking-[-0.03em] uppercase">
            Page title
          </h1>
        </div>
      </ScaledPreviewFrame>
    );
  }
  if (blockId === "h2") {
    return (
      <ScaledPreviewFrame>
        <div className="bg-sc-section px-10 py-8">
          <h2 className="text-[clamp(1.6rem,3vw,2.3rem)] font-black tracking-[-0.03em] uppercase">
            Section heading
          </h2>
        </div>
      </ScaledPreviewFrame>
    );
  }
  if (blockId === "h3") {
    return (
      <ScaledPreviewFrame>
        <div className="bg-sc-section px-10 py-8">
          <h3 className="text-[1.35rem] font-black tracking-[-0.02em]">
            Subheading
          </h3>
        </div>
      </ScaledPreviewFrame>
    );
  }
  if (blockId === "quote") {
    return (
      <ScaledPreviewFrame>
        <div className="bg-sc-section px-10 py-6">
          <blockquote
            className={cn(appQuoteOuter, appQuoteInner, "not-italic")}
          >
            A pull quote that highlights an important idea from the page.
          </blockquote>
        </div>
      </ScaledPreviewFrame>
    );
  }
  return (
    <ScaledPreviewFrame>
      <div className="bg-sc-section px-10 py-6">
        <p className="text-[16px] leading-[1.8] text-[#3f3b34]">
          Body copy for a paragraph block. Use this for long-form content
          between sections.
        </p>
      </div>
    </ScaledPreviewFrame>
  );
}

function SectionPreview({
  blockId,
  catalogPosts,
}: {
  blockId: InsertContentBlockId;
  catalogPosts: PublicContentSummary[];
}) {
  switch (blockId) {
    case "hero":
      return <HeroSection data={DEFAULT_HERO} />;
    case "blog":
      return (
        <BlogPostsSection data={DEFAULT_BLOG_SECTION} posts={catalogPosts} />
      );
    case "cta":
      return <CtaMarketingSection data={DEFAULT_CTA_SECTION} />;
    case "page-header":
      return <PageHeaderSection data={DEFAULT_PAGE_HEADER_SECTION} />;
    case "page-intro":
      return <PageIntroSection data={DEFAULT_PAGE_INTRO_SECTION} />;
    case "feature-grid":
      return <FeatureGridSection data={DEFAULT_FEATURE_GRID_SECTION} />;
    case "steps":
      return <StepsSection data={DEFAULT_STEPS_SECTION} />;
    default:
      return null;
  }
}

export function ContentBlockPreview({
  blockId,
}: {
  blockId: InsertContentBlockId;
}) {
  const catalogPosts = useContentEditorPosts();

  if (
    blockId === "paragraph" ||
    blockId === "h1" ||
    blockId === "h2" ||
    blockId === "h3" ||
    blockId === "quote"
  ) {
    return <TextBlockPreview blockId={blockId} />;
  }

  return (
    <ScaledPreviewFrame>
      <SectionPreview blockId={blockId} catalogPosts={catalogPosts} />
    </ScaledPreviewFrame>
  );
}
