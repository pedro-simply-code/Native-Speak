"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { Link2, Plus, Settings2, X } from "lucide-react";
import { type ReactElement } from "react";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionSelect,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  LinkUrlPopover,
  linkFieldSummary,
} from "@/components/cms-lexical/link-url-popover";
import {
  DEFAULT_PAGE_HEADER_SECTION,
  normalizePageHeaderSectionData,
  PAGE_HEADER_SECTION_NODE_TYPE,
  type PageHeaderLink,
  type PageHeaderSectionData,
} from "@/lib/cms/site-page-sections";
import { appChip, appSectionBand, appSectionContainer } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export type SerializedPageHeaderSectionNode = Spread<
  { data: PageHeaderSectionData },
  SerializedLexicalNode
>;

export class PageHeaderSectionNode extends DecoratorNode<ReactElement> {
  __data: PageHeaderSectionData;

  static getType(): string {
    return PAGE_HEADER_SECTION_NODE_TYPE;
  }

  static clone(node: PageHeaderSectionNode): PageHeaderSectionNode {
    return new PageHeaderSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedPageHeaderSectionNode,
  ): PageHeaderSectionNode {
    return $createPageHeaderSectionNode(
      normalizePageHeaderSectionData(serializedNode.data),
    );
  }

  constructor(data?: PageHeaderSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizePageHeaderSectionData(data);
  }

  exportJSON(): SerializedPageHeaderSectionNode {
    return {
      ...super.exportJSON(),
      type: PAGE_HEADER_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-page-header-node";
    div.dataset.editorBlock = "page-header";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): PageHeaderSectionData {
    return this.getLatest().__data;
  }

  setData(data: PageHeaderSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return (
      <PageHeaderSectionEditor nodeKey={this.getKey()} data={this.__data} />
    );
  }
}

export function $createPageHeaderSectionNode(
  data: PageHeaderSectionData = DEFAULT_PAGE_HEADER_SECTION,
): PageHeaderSectionNode {
  return $applyNodeReplacement(new PageHeaderSectionNode(data));
}

export function $isPageHeaderSectionNode(
  node: LexicalNode | null | undefined,
): node is PageHeaderSectionNode {
  return node instanceof PageHeaderSectionNode;
}

function PageHeaderSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: PageHeaderSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isPageHeaderSectionNode,
  );

  const updateTag = (index: number, patch: Partial<PageHeaderLink>) => {
    update({
      tags: data.tags.map((tag, tagIndex) =>
        tagIndex === index ? { ...tag, ...patch } : tag,
      ),
    });
  };

  const addTag = () =>
    update({ tags: [...data.tags, { label: "", href: "" }] });

  const removeTag = (index: number) =>
    update({ tags: data.tags.filter((_, tagIndex) => tagIndex !== index) });

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="page-header"
    >
      <BlockDecoratorToolbar label="Page header" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Page header"
        >
          <SectionOptionSelect
            label="Background"
            value={data.surface}
            onChange={(value) =>
              update({
                surface: value === "default" ? "default" : "alt",
              })
            }
            options={[
              { value: "alt", label: "Alt band" },
              { value: "default", label: "Default band" },
            ]}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <section
        className={cn(
          appSectionBand,
          "border-b border-[#15130f]/10 py-16 lg:py-24",
          data.surface === "alt" ? "bg-sc-section-alt" : "bg-sc-section",
        )}
      >
        <div className={appSectionContainer}>
          <InlineText
            as="p"
            value={data.eyebrow}
            onChange={(eyebrow) => update({ eyebrow })}
            className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
          />
          <InlineText
            as="h1"
            value={data.headline}
            onChange={(headline) => update({ headline })}
            className="mt-5 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] font-black tracking-[-0.045em] whitespace-pre-line uppercase"
          />
          <InlineText
            as="p"
            value={data.description}
            onChange={(description) => update({ description })}
            className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#57524a]"
          />
          {data.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap items-center gap-2">
              {data.tags.map((tag, index) => (
                <span key={index} className="group/tag relative inline-flex">
                  <span
                    className={cn(
                      appChip,
                      "cursor-text px-4 py-2 text-[11px] tracking-[0.12em]",
                    )}
                  >
                    <InlineText
                      value={tag.label}
                      onChange={(label) => updateTag(index, { label })}
                      placeholder="Chip label"
                    />
                  </span>
                  <LinkUrlPopover
                    value={{ href: tag.href, newTab: false, nofollow: false }}
                    onPrepare={() => ({
                      href: tag.href,
                      newTab: false,
                      nofollow: false,
                    })}
                    onSave={(value) => updateTag(index, { href: value.href })}
                    title="Chip link"
                    hint="Anchor (#section), path (/contact) or full URL."
                    placeholder="#ux-design or /contact"
                    trigger={
                      <button
                        type="button"
                        title={`Edit link (${linkFieldSummary({ href: tag.href, newTab: false, nofollow: false })})`}
                        aria-label="Edit chip link"
                        className="absolute -top-2 -right-2 inline-flex size-5 items-center justify-center rounded-full bg-[#15130f] text-white opacity-0 shadow-md transition-opacity group-hover/tag:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                      >
                        <Link2 className="size-3" />
                      </button>
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    aria-label="Remove chip"
                    title="Remove chip"
                    className="absolute -top-2 -left-2 inline-flex size-5 items-center justify-center rounded-full bg-[#15130f]/90 text-white/80 opacity-0 shadow-sm transition-opacity group-hover/tag:opacity-100 hover:bg-[#15130f] hover:text-white focus-visible:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={addTag}
            className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase transition-colors hover:text-[#15130f]"
          >
            <Plus className="size-3.5" /> Add chip
          </button>
        </div>
      </section>
    </div>
  );
}
