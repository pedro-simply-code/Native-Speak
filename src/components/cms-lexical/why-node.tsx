"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { Layers, Link2, Ruler, Settings2, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type ReactElement } from "react";
import { WhySection } from "@/components/cms-content/why-section";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionCheckbox,
  SectionOptionSelect,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import { LinkUrlPopover } from "@/components/cms-lexical/link-url-popover";
import {
  DEFAULT_WHY_FEATURES,
  DEFAULT_WHY_SECTION,
  normalizeWhySectionData,
  WHY_SECTION_NODE_TYPE,
  type WhyFeature,
  type WhySectionData,
} from "@/lib/cms/homepage-sections";
import type { LinkFieldValue } from "@/lib/cms/link-options";

const FEATURE_ICONS: Record<WhyFeature["icon"], LucideIcon> = {
  ruler: Ruler,
  layers: Layers,
  zap: Zap,
};

export type SerializedWhySectionNode = Spread<
  { data: WhySectionData },
  SerializedLexicalNode
>;

export class WhySectionNode extends DecoratorNode<ReactElement> {
  __data: WhySectionData;

  static getType(): string {
    return WHY_SECTION_NODE_TYPE;
  }

  static clone(node: WhySectionNode): WhySectionNode {
    return new WhySectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedWhySectionNode,
  ): WhySectionNode {
    return $createWhySectionNode(normalizeWhySectionData(serializedNode.data));
  }

  constructor(data?: WhySectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeWhySectionData(data);
  }

  exportJSON(): SerializedWhySectionNode {
    return {
      ...super.exportJSON(),
      type: WHY_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-why-node";
    div.dataset.editorBlock = "why";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): WhySectionData {
    return this.getLatest().__data;
  }

  setData(data: WhySectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return <WhySectionEditor nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createWhySectionNode(
  data: WhySectionData = DEFAULT_WHY_SECTION,
): WhySectionNode {
  return $applyNodeReplacement(new WhySectionNode(data));
}

export function $isWhySectionNode(
  node: LexicalNode | null | undefined,
): node is WhySectionNode {
  return node instanceof WhySectionNode;
}

function WhySectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: WhySectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(nodeKey, $isWhySectionNode);

  const updateFeature = (index: number, patch: Partial<WhyFeature>) => {
    update({
      features: data.features.map((f, i) =>
        i === index ? { ...f, ...patch } : f,
      ),
    });
  };

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="why"
    >
      <BlockDecoratorToolbar label="Why us" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Why choose us"
          description="Toggle layout pieces here. Edit headlines, features, and links on the canvas."
        >
          <SectionOptionSelect
            label="Feature highlights"
            value={data.features.length}
            onChange={(value) => {
              const count = Math.min(
                3,
                Math.max(1, Number(value) || DEFAULT_WHY_FEATURES.length),
              );
              update({
                features: DEFAULT_WHY_FEATURES.slice(0, count).map((f) => ({
                  ...f,
                })),
              });
            }}
            options={[1, 2, 3].map((count) => ({
              value: count,
              label: `${count} feature${count === 1 ? "" : "s"}`,
            }))}
          />
          <SectionOptionCheckbox
            label="Show build progress panel"
            checked={data.showBuildPanel}
            onChange={(checked) => update({ showBuildPanel: checked })}
          />
          <SectionOptionCheckbox
            label="Show team link"
            checked={data.showLink}
            onChange={(checked) => update({ showLink: checked })}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <WhySection
        data={data}
        introOverride={
          <>
            <InlineText
              as="p"
              value={data.eyebrow}
              onChange={(v) => update({ eyebrow: v })}
              className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
            />
            <InlineText
              as="h2"
              multiline
              value={data.headline}
              onChange={(v) => update({ headline: v })}
              className="mt-5 text-[clamp(1.85rem,4.1vw,3.05rem)] leading-[1.04] font-black tracking-[-0.03em] uppercase"
            />
            <InlineText
              as="p"
              multiline
              value={data.description}
              onChange={(v) => update({ description: v })}
              className="mt-6 text-[16px] leading-relaxed text-[#57524a]"
            />
          </>
        }
        featuresSlot={
          <>
            {data.features.map((feature, index) => {
              const Icon = FEATURE_ICONS[feature.icon] ?? Ruler;
              return (
                <div key={`${feature.title}-${index}`} className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center bg-[#15130f] text-white">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <InlineText
                      as="h3"
                      value={feature.title}
                      onChange={(v) => updateFeature(index, { title: v })}
                      className="font-bold tracking-tight"
                    />
                    <InlineText
                      as="p"
                      multiline
                      value={feature.summary}
                      onChange={(v) => updateFeature(index, { summary: v })}
                      className="mt-1 text-[14px] leading-relaxed text-[#57524a]"
                    />
                  </div>
                </div>
              );
            })}
          </>
        }
        buildPanelTitleOverride={
          <InlineText
            value={data.panelTitle}
            onChange={(v) => update({ panelTitle: v })}
            className="text-[10px] font-bold tracking-[0.16em] uppercase"
          />
        }
        afterFeaturesOverride={
          data.showLink ? (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <InlineText
                value={data.linkLabel}
                onChange={(v) => update({ linkLabel: v })}
                placeholder="Link label"
                className="text-[11px] font-bold tracking-[0.16em] uppercase underline underline-offset-4"
              />
              <LinkUrlPopover
                value={{
                  href: data.linkHref,
                  newTab: data.linkNewTab,
                  nofollow: false,
                }}
                onPrepare={() => ({
                  href: data.linkHref,
                  newTab: data.linkNewTab,
                  nofollow: false,
                })}
                onSave={(value: LinkFieldValue) =>
                  update({ linkHref: value.href, linkNewTab: value.newTab })
                }
                trigger={
                  <button
                    type="button"
                    className="inline-flex size-8 items-center justify-center rounded border bg-white"
                    aria-label="Edit link"
                  >
                    <Link2 className="size-4" />
                  </button>
                }
              />
            </div>
          ) : null
        }
      />
    </div>
  );
}
