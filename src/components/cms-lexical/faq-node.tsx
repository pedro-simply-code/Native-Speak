"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { ArrowRight, Link2, Plus, Settings2, X } from "lucide-react";
import { type ReactElement } from "react";
import { FaqPageSection } from "@/components/cms-content/faq-page-section";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import { LinkUrlPopover, linkFieldSummary } from "@/components/cms-lexical/link-url-popover";
import {
  DEFAULT_FAQ_SECTION,
  FAQ_SECTION_NODE_TYPE,
  normalizeFaqSectionData,
  type FaqItemBlock,
  type FaqSectionData,
} from "@/lib/cms/site-page-sections";
import type { LinkFieldValue } from "@/lib/cms/link-options";

export type SerializedFaqSectionNode = Spread<
  { data: FaqSectionData },
  SerializedLexicalNode
>;

export class FaqSectionNode extends DecoratorNode<ReactElement> {
  __data: FaqSectionData;

  static getType(): string {
    return FAQ_SECTION_NODE_TYPE;
  }

  static clone(node: FaqSectionNode): FaqSectionNode {
    return new FaqSectionNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: SerializedFaqSectionNode): FaqSectionNode {
    return $createFaqSectionNode(normalizeFaqSectionData(serializedNode.data));
  }

  constructor(data?: FaqSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeFaqSectionData(data);
  }

  exportJSON(): SerializedFaqSectionNode {
    return {
      ...super.exportJSON(),
      type: FAQ_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-faq-node";
    div.dataset.editorBlock = "faq";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): FaqSectionData {
    return this.getLatest().__data;
  }

  setData(data: FaqSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return <FaqSectionEditor nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createFaqSectionNode(
  data: FaqSectionData = DEFAULT_FAQ_SECTION,
): FaqSectionNode {
  return $applyNodeReplacement(new FaqSectionNode(data));
}

export function $isFaqSectionNode(
  node: LexicalNode | null | undefined,
): node is FaqSectionNode {
  return node instanceof FaqSectionNode;
}

function FaqSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: FaqSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(nodeKey, $isFaqSectionNode);

  const patchItems = (items: FaqItemBlock[]) => {
    update({ items: items.slice(0, 24) });
  };

  const updateItem = (index: number, patch: Partial<FaqItemBlock>) => {
    patchItems(
      data.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const removeItem = (index: number) => {
    patchItems(data.items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    if (data.items.length >= 24) return;
    patchItems([
      ...data.items,
      { question: "New question?", answer: "Your answer here." },
    ]);
  };

  const ctaLink: LinkFieldValue = {
    href: data.ctaHref,
    newTab: false,
    nofollow: false,
  };

  const sidebarOverride = (
    <>
      <InlineText
        as="p"
        value={data.eyebrow}
        onChange={(v) => update({ eyebrow: v })}
        className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
      />
      <InlineText
        as="h1"
        multiline
        value={data.headline}
        onChange={(v) => update({ headline: v })}
        className="mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase"
      />
      <InlineText
        as="p"
        multiline
        value={data.description}
        onChange={(v) => update({ description: v })}
        className="mt-6 max-w-md text-[16px] leading-relaxed text-[#57524a]"
      />
      <span className="group/cta relative mt-8 inline-flex">
        <span className="inline-flex items-center gap-2 rounded-md bg-[#15130f] px-6 py-3.5 text-[11px] font-bold tracking-[0.16em] text-white uppercase">
          <InlineText
            value={data.ctaLabel}
            onChange={(v) => update({ ctaLabel: v })}
            placeholder="Ask us directly"
          />
          <ArrowRight className="size-4" />
        </span>
        <LinkUrlPopover
          value={ctaLink}
          onPrepare={() => ctaLink}
          onSave={(value) => update({ ctaHref: value.href })}
          title="CTA link"
          trigger={
            <button
              type="button"
              aria-label="Edit CTA link"
              className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full bg-[#15130f] text-white opacity-0 shadow-md transition-opacity group-hover/cta:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            >
              <Link2 className="size-3" />
            </button>
          }
        />
      </span>
      <InlineText
        as="p"
        value={data.emailNote}
        onChange={(v) => update({ emailNote: v })}
        className="mt-4 block text-[13px] text-[#6f6a60]"
      />
    </>
  );

  const itemsOverride = (
    <div className="divide-y divide-[#15130f]/12 border-y border-[#15130f]/12">
      {data.items.map((item, index) => (
        <div
          key={`faq-${index}`}
          className="group/faq relative py-5 pr-8"
        >
          <InlineText
            as="p"
            value={item.question}
            onChange={(v) => updateItem(index, { question: v })}
            className="block text-[17px] leading-snug font-bold tracking-tight"
          />
          <InlineText
            as="p"
            multiline
            value={item.answer}
            onChange={(v) => updateItem(index, { answer: v })}
            className="mt-3 block max-w-2xl text-[15px] leading-relaxed whitespace-pre-wrap text-[#57524a]"
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            aria-label="Remove question"
            className="absolute top-4 right-0 inline-flex size-7 items-center justify-center rounded-full bg-[#15130f]/90 text-white opacity-0 transition-opacity group-hover/faq:opacity-100 focus-visible:opacity-100"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
      {data.items.length < 24 ? (
        <button
          type="button"
          onClick={addItem}
          className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase transition-colors hover:text-[#15130f]"
        >
          <Plus className="size-3.5" /> Add question
        </button>
      ) : null}
    </div>
  );

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="faq"
    >
      <BlockDecoratorToolbar label="FAQ" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="FAQ page"
          description="Two-column FAQ layout. Add or remove questions on the canvas."
        >
          <p className="text-[12px] text-[#57524a]">
            Use <strong>Add question</strong> below the list.
          </p>
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <FaqPageSection
        data={data}
        introOverride={sidebarOverride}
        itemsOverride={itemsOverride}
      />
    </div>
  );
}
