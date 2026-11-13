"use client";

import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createParagraphNode, type LexicalEditor } from "lexical";
import {
  createBlogSectionNode,
  createCtaSectionNode,
  createFeatureGridSectionNode,
  createHeroNode,
  createMarketingBlock,
  createPageHeaderSectionNode,
  createPageIntroSectionNode,
  createStepsSectionNode,
} from "@/components/cms-lexical/create-block-nodes";
import {
  $insertDecoratorBlock,
  $insertProseBlock,
} from "@/components/cms-lexical/insert-decorator-block";

import type { InsertContentBlockId } from "@/components/cms-lexical/insert-content-block-types";

export type { InsertContentBlockId } from "@/components/cms-lexical/insert-content-block-types";

const MARKETING_BLOCKS = new Set<InsertContentBlockId>([
  "onboarding-trio",
  "bullet-list",
  "bullet-cta",
  "faq",
  "dual-cta",
  "testimonials",
  "lead-form",
  "pricing-picker",
  "progress",
  "programs-showcase",
  "programs-grid",
  "program-detail",
  "blog-header",
]);

export function insertContentBlock(
  editor: LexicalEditor,
  value: InsertContentBlockId,
) {
  editor.update(
    () => {
      if (value === "hero") {
        $insertDecoratorBlock(() => createHeroNode());
        return;
      }
      if (value === "cta") {
        $insertDecoratorBlock(() => createCtaSectionNode());
        return;
      }
      if (value === "page-header") {
        $insertDecoratorBlock(() => createPageHeaderSectionNode());
        return;
      }
      if (value === "page-intro") {
        $insertDecoratorBlock(() => createPageIntroSectionNode());
        return;
      }
      if (value === "feature-grid") {
        $insertDecoratorBlock(() => createFeatureGridSectionNode());
        return;
      }
      if (value === "steps") {
        $insertDecoratorBlock(() => createStepsSectionNode());
        return;
      }
      if (value === "blog") {
        $insertDecoratorBlock(() => createBlogSectionNode());
        return;
      }
      if (MARKETING_BLOCKS.has(value)) {
        $insertDecoratorBlock(() => createMarketingBlock(value));
        return;
      }

      if (value === "quote") {
        $insertProseBlock(() => $createQuoteNode());
        return;
      }
      if (value === "paragraph") {
        $insertProseBlock(() => $createParagraphNode());
        return;
      }
      if (value === "h1" || value === "h2" || value === "h3") {
        $insertProseBlock(() => $createHeadingNode(value));
      }
    },
    { onUpdate: () => editor.focus() },
  );
}
