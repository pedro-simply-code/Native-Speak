"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { ArrowRight, Link2, Settings2 } from "lucide-react";
import { useState, type ReactElement } from "react";
import { WorkSection } from "@/components/cms-content/work-section";
import { useContentEditorProjects } from "@/components/cms-lexical/content-editor-projects-context";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionCheckbox,
  SectionOptionSelect,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import { LinkUrlPopover, linkFieldSummary } from "@/components/cms-lexical/link-url-popover";
import {
  DEFAULT_WORK_SECTION,
  normalizeWorkSectionData,
  WORK_SECTION_NODE_TYPE,
  type WorkSectionData,
} from "@/lib/cms/homepage-sections";
import type { LinkFieldValue } from "@/lib/cms/link-options";
import { appPrimaryButtonMarketingLg } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export type SerializedWorkSectionNode = Spread<
  { data: WorkSectionData },
  SerializedLexicalNode
>;

export class WorkSectionNode extends DecoratorNode<ReactElement> {
  __data: WorkSectionData;

  static getType(): string {
    return WORK_SECTION_NODE_TYPE;
  }

  static clone(node: WorkSectionNode): WorkSectionNode {
    return new WorkSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedWorkSectionNode,
  ): WorkSectionNode {
    return $createWorkSectionNode(
      normalizeWorkSectionData(serializedNode.data),
    );
  }

  constructor(data?: WorkSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeWorkSectionData(data);
  }

  exportJSON(): SerializedWorkSectionNode {
    return {
      ...super.exportJSON(),
      type: WORK_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-work-node";
    div.dataset.editorBlock =
      this.__data.variant === "portfolio" ? "portfolio" : "work";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): WorkSectionData {
    return this.getLatest().__data;
  }

  setData(data: WorkSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return <WorkSectionEditor nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createWorkSectionNode(
  data: WorkSectionData = DEFAULT_WORK_SECTION,
): WorkSectionNode {
  return $applyNodeReplacement(new WorkSectionNode(data));
}

export function $isWorkSectionNode(
  node: LexicalNode | null | undefined,
): node is WorkSectionNode {
  return node instanceof WorkSectionNode;
}

function WorkSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: WorkSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(nodeKey, $isWorkSectionNode);
  const [previewEmpty, setPreviewEmpty] = useState(false);
  const catalogProjects = useContentEditorProjects();
  const isPortfolio = data.variant === "portfolio";
  const blockLabel = isPortfolio ? "Projects" : "Work";

  const projects = previewEmpty
    ? []
    : isPortfolio
      ? catalogProjects
      : catalogProjects.slice(0, data.projectCount);

  const introFields = (
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
        className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase whitespace-pre-line"
      />
      <InlineText
        as="p"
        multiline
        value={data.description}
        onChange={(v) => update({ description: v })}
        className="mt-6 text-[16px] leading-relaxed whitespace-pre-wrap text-[#57524a]"
      />
    </>
  );

  const ctaLink: LinkFieldValue = {
    href: data.ctaHref,
    newTab: data.ctaNewTab,
    nofollow: false,
  };

  const ctaSlot =
    !isPortfolio && data.showCta ? (
      <div className="mt-12 text-center">
        <span className="group/action relative inline-flex">
          <span className={cn("cursor-text", appPrimaryButtonMarketingLg)}>
            <InlineText
              value={data.ctaLabel}
              onChange={(v) => update({ ctaLabel: v })}
              placeholder="See all work"
            />
            <ArrowRight className="size-4" aria-hidden />
          </span>
          <LinkUrlPopover
            value={ctaLink}
            onSave={(value: LinkFieldValue) =>
              update({ ctaHref: value.href, ctaNewTab: value.newTab })
            }
            title="Button link"
            placeholder="/work or https://…"
            trigger={
              <button
                type="button"
                title={`Edit link (${linkFieldSummary(ctaLink)})`}
                aria-label="Edit button link"
                className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full bg-[#15130f] text-white opacity-0 shadow-md transition-opacity group-hover/action:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
              >
                <Link2 className="size-3" />
              </button>
            }
          />
        </span>
      </div>
    ) : undefined;

  return (
    <div
      contentEditable={false}
      className="group/block text-sc-ink relative"
      data-editor-block={isPortfolio ? "portfolio" : "work"}
    >
      <BlockDecoratorToolbar label={blockLabel} onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title={isPortfolio ? "Projects" : "Featured work"}
          description={
            isPortfolio
              ? "Shows every published project from the studio catalog. Toggle the tag filter to match the /work page."
              : "Projects load from the site catalog when published. Edit headings and copy on the canvas."
          }
        >
          {isPortfolio ? (
            <SectionOptionCheckbox
              label="Show tag filter"
              checked={data.showTagFilter}
              onChange={(checked) => update({ showTagFilter: checked })}
            />
          ) : (
            <>
              <SectionOptionSelect
                label="Projects shown"
                value={data.projectCount}
                onChange={(value) =>
                  update({
                    projectCount: Math.min(
                      6,
                      Math.max(
                        1,
                        Number(value) || DEFAULT_WORK_SECTION.projectCount,
                      ),
                    ),
                  })
                }
                options={[1, 2, 3, 4, 5, 6].map((count) => ({
                  value: count,
                  label: `${count} project${count === 1 ? "" : "s"}`,
                }))}
              />
              <SectionOptionCheckbox
                label='Show "See all work" button'
                checked={data.showCta}
                onChange={(checked) => update({ showCta: checked })}
              />
            </>
          )}
          <SectionOptionCheckbox
            label="Preview empty state (editor only)"
            checked={previewEmpty}
            onChange={setPreviewEmpty}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <WorkSection
        data={data}
        projects={projects}
        // Portfolio has no intro block — it starts at the filter bar.
        introOverride={isPortfolio ? undefined : introFields}
        ctaSlot={ctaSlot}
        emptyMessageOverride={
          <InlineText
            value={data.emptyMessage}
            onChange={(v) => update({ emptyMessage: v })}
            className="block text-[15px]"
          />
        }
      />
    </div>
  );
}
