"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { Settings2 } from "lucide-react";
import { useState, type ReactElement } from "react";
import { ReviewsSection } from "@/components/cms-content/reviews-section";
import { TESTIMONIALS } from "@/cms-seed-content/testimonials";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionCheckbox,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  DEFAULT_REVIEWS_SECTION,
  normalizeReviewsSectionData,
  REVIEWS_SECTION_NODE_TYPE,
  type ReviewsSectionData,
} from "@/lib/cms/homepage-sections";
import { resolveReviewsSectionDescription } from "@/lib/cms/reviews";

export type SerializedReviewsSectionNode = Spread<
  { data: ReviewsSectionData },
  SerializedLexicalNode
>;

export class ReviewsSectionNode extends DecoratorNode<ReactElement> {
  __data: ReviewsSectionData;

  static getType(): string {
    return REVIEWS_SECTION_NODE_TYPE;
  }

  static clone(node: ReviewsSectionNode): ReviewsSectionNode {
    return new ReviewsSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedReviewsSectionNode,
  ): ReviewsSectionNode {
    return $createReviewsSectionNode(
      normalizeReviewsSectionData(serializedNode.data),
    );
  }

  constructor(data?: ReviewsSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeReviewsSectionData(data);
  }

  exportJSON(): SerializedReviewsSectionNode {
    return {
      ...super.exportJSON(),
      type: REVIEWS_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-reviews-node";
    div.dataset.editorBlock = "reviews";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): ReviewsSectionData {
    return this.getLatest().__data;
  }

  setData(data: ReviewsSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return (
      <ReviewsSectionEditor nodeKey={this.getKey()} data={this.__data} />
    );
  }
}

export function $createReviewsSectionNode(
  data: ReviewsSectionData = DEFAULT_REVIEWS_SECTION,
): ReviewsSectionNode {
  return $applyNodeReplacement(new ReviewsSectionNode(data));
}

export function $isReviewsSectionNode(
  node: LexicalNode | null | undefined,
): node is ReviewsSectionNode {
  return node instanceof ReviewsSectionNode;
}

function ReviewsSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: ReviewsSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isReviewsSectionNode,
  );
  const [previewEmpty, setPreviewEmpty] = useState(false);

  const testimonials = previewEmpty ? [] : TESTIMONIALS;
  const introDescription = resolveReviewsSectionDescription(
    data.description,
    testimonials,
    false,
  );

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="reviews"
    >
      <BlockDecoratorToolbar label="Reviews" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Client proof"
          description="Testimonials load from approved reviews when published. Edit all copy on the canvas."
        >
          <SectionOptionCheckbox
            label="Preview empty state (editor only)"
            checked={previewEmpty}
            onChange={setPreviewEmpty}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <ReviewsSection
        data={data}
        testimonials={testimonials}
        introOverride={
          previewEmpty ? (
            <>
              <InlineText
                as="p"
                value={data.emptyEyebrow}
                onChange={(v) => update({ emptyEyebrow: v })}
                className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
              />
              <InlineText
                as="h2"
                value={data.emptyHeadline}
                onChange={(v) => update({ emptyHeadline: v })}
                className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase"
              />
              <InlineText
                as="p"
                multiline
                value={data.emptyDescription}
                onChange={(v) => update({ emptyDescription: v })}
                className="mt-6 text-[16px] leading-relaxed text-[#57524a]"
              />
            </>
          ) : (
            <>
              <InlineText
                as="p"
                value={data.eyebrow}
                onChange={(v) => update({ eyebrow: v })}
                className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
              />
              <InlineText
                as="h2"
                value={data.headline}
                onChange={(v) => update({ headline: v })}
                className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase"
              />
              <InlineText
                as="p"
                multiline
                value={introDescription}
                onChange={(v) => update({ description: v })}
                className="mt-6 text-[16px] leading-relaxed text-[#57524a]"
              />
            </>
          )
        }
      />
    </div>
  );
}
