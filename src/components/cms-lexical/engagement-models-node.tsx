"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { ArrowRight, Link2, Plus, X } from "lucide-react";
import type { ReactElement } from "react";
import {
  BlockDecoratorToolbar,
  InlineText,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  LinkUrlPopover,
  linkFieldSummary,
} from "@/components/cms-lexical/link-url-popover";
import { EngagementModelsSection } from "@/components/cms-content/engagement-models-section";
import {
  appAccentBrightButtonMarketingSm,
  siteMotionLift,
  siteStagger,
} from "@/lib/cms/surface";
import {
  DEFAULT_ENGAGEMENT_MODELS_SECTION,
  ENGAGEMENT_MODELS_SECTION_NODE_TYPE,
  normalizeEngagementModelsSectionData,
  type EngagementCard,
  type EngagementModelsSectionData,
} from "@/lib/cms/site-page-sections";
import { cn } from "@/lib/utils";

export type SerializedEngagementModelsSectionNode = Spread<
  { data: EngagementModelsSectionData },
  SerializedLexicalNode
>;

export class EngagementModelsSectionNode extends DecoratorNode<ReactElement> {
  __data: EngagementModelsSectionData;

  static getType(): string {
    return ENGAGEMENT_MODELS_SECTION_NODE_TYPE;
  }

  static clone(node: EngagementModelsSectionNode): EngagementModelsSectionNode {
    return new EngagementModelsSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedEngagementModelsSectionNode,
  ): EngagementModelsSectionNode {
    return $createEngagementModelsSectionNode(
      normalizeEngagementModelsSectionData(serializedNode.data),
    );
  }

  constructor(data?: EngagementModelsSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeEngagementModelsSectionData(data);
  }

  exportJSON(): SerializedEngagementModelsSectionNode {
    return {
      ...super.exportJSON(),
      type: ENGAGEMENT_MODELS_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-engagement-models-node";
    div.dataset.editorBlock = "engagement-models";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): EngagementModelsSectionData {
    return this.getLatest().__data;
  }

  setData(data: EngagementModelsSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return (
      <EngagementModelsSectionEditor
        nodeKey={this.getKey()}
        data={this.__data}
      />
    );
  }
}

export function $createEngagementModelsSectionNode(
  data: EngagementModelsSectionData = DEFAULT_ENGAGEMENT_MODELS_SECTION,
): EngagementModelsSectionNode {
  return $applyNodeReplacement(new EngagementModelsSectionNode(data));
}

export function $isEngagementModelsSectionNode(
  node: LexicalNode | null | undefined,
): node is EngagementModelsSectionNode {
  return node instanceof EngagementModelsSectionNode;
}

function EngagementModelsSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: EngagementModelsSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isEngagementModelsSectionNode,
  );

  const updateModel = (index: number, patch: Partial<EngagementCard>) => {
    update({
      models: data.models.map((model, modelIndex) =>
        modelIndex === index ? { ...model, ...patch } : model,
      ),
    });
  };

  const addModel = () => {
    update({
      models: [...data.models, { title: "", description: "", bestFor: "" }],
    });
  };

  const removeModel = (index: number) => {
    update({
      models: data.models.filter((_, modelIndex) => modelIndex !== index),
    });
  };

  const updateEmail = (email: string) => {
    update({
      email,
      emailHref:
        data.emailHref === `mailto:${data.email}`
          ? `mailto:${email}`
          : data.emailHref,
    });
  };

  return (
    <div
      contentEditable={false}
      className="group/block text-sc-ink relative"
      data-editor-block="engagement-models"
    >
      <BlockDecoratorToolbar label="Engagement models" onRemove={remove} />

      <EngagementModelsSection
        data={data}
        headerOverride={
          <>
            <InlineText
              as="p"
              value={data.eyebrow}
              onChange={(eyebrow) => update({ eyebrow })}
              placeholder="How We Work"
              className="text-sc-accent-bright text-[11px] font-bold tracking-[0.24em] uppercase"
            />
            <InlineText
              as="h2"
              value={data.headline}
              onChange={(headline) => update({ headline })}
              placeholder="Three Ways To Work Together"
              className="mt-5 max-w-3xl text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase"
            />
            <InlineText
              as="p"
              multiline
              value={data.description}
              onChange={(description) => update({ description })}
              placeholder="Engagement models introduction…"
              className="mt-6 max-w-2xl text-[16px] leading-relaxed whitespace-pre-wrap text-white/60"
            />
          </>
        }
        modelsOverride={
          <>
            <div className={cn(siteStagger, "mt-12 grid gap-6 lg:grid-cols-3")}>
              {data.models.map((model, index) => (
                <div
                  key={index}
                  className={cn(
                    siteMotionLift,
                    "group/model relative flex flex-col rounded-lg bg-white/[0.03] p-8 shadow-[0_2px_16px_rgba(0,0,0,0.2)] ring-1 ring-white/10",
                  )}
                >
                  <span className="text-sc-accent-bright text-[11px] font-bold tracking-[0.2em]">
                    0{index + 1}
                  </span>
                  <InlineText
                    as="h3"
                    value={model.title}
                    onChange={(title) => updateModel(index, { title })}
                    placeholder="Model title"
                    className="mt-4 text-xl font-black tracking-tight uppercase"
                  />
                  <InlineText
                    as="p"
                    multiline
                    value={model.description}
                    onChange={(description) =>
                      updateModel(index, { description })
                    }
                    placeholder="Describe how this model works…"
                    className="mt-4 flex-1 text-[14px] leading-relaxed whitespace-pre-wrap text-white/60"
                  />
                  <p className="mt-6 border-t border-white/10 pt-4 text-[12px] leading-relaxed text-white/45">
                    <span className="font-bold tracking-[0.12em] text-white/70 uppercase">
                      Best for:
                    </span>{" "}
                    <InlineText
                      as="span"
                      value={model.bestFor}
                      onChange={(bestFor) => updateModel(index, { bestFor })}
                      placeholder="Who this is for"
                      className="text-white/50"
                    />
                  </p>
                  <button
                    type="button"
                    onClick={() => removeModel(index)}
                    aria-label="Remove model"
                    title="Remove model"
                    className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full bg-[#15130f] text-white/80 opacity-0 shadow-md ring-1 ring-white/20 transition-opacity group-hover/model:opacity-100 hover:text-white focus-visible:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={addModel}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-white/50 uppercase transition-colors hover:text-white"
              >
                <Plus className="size-3.5" /> Add model
              </button>
            </div>
          </>
        }
        actionsOverride={
          <div className="mt-12 flex flex-wrap items-center gap-5">
            {data.buttonLabel.trim() ? (
              <span className="group/action relative inline-flex">
                <span
                  className={cn(
                    appAccentBrightButtonMarketingSm,
                    "cursor-text",
                  )}
                >
                  <InlineText
                    value={data.buttonLabel}
                    onChange={(buttonLabel) => update({ buttonLabel })}
                    placeholder="Request a quote"
                  />
                  <ArrowRight className="size-4" aria-hidden />
                </span>
                <LinkUrlPopover
                  value={{
                    href: data.buttonHref,
                    newTab: data.buttonNewTab,
                    nofollow: data.buttonNofollow,
                  }}
                  onPrepare={() => ({
                    href: data.buttonHref,
                    newTab: data.buttonNewTab,
                    nofollow: data.buttonNofollow,
                  })}
                  onSave={(value) =>
                    update({
                      buttonHref: value.href,
                      buttonNewTab: value.newTab,
                      buttonNofollow: value.nofollow,
                    })
                  }
                  title="Button link"
                  hint="Use a path, an anchor or a full URL."
                  placeholder="/contact or https://…"
                  trigger={
                    <button
                      type="button"
                      title={`Edit link (${linkFieldSummary({
                        href: data.buttonHref,
                        newTab: data.buttonNewTab,
                        nofollow: data.buttonNofollow,
                      })})`}
                      aria-label="Edit button link"
                      className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full bg-[#15130f] text-white opacity-0 shadow-md ring-1 ring-white/40 transition-opacity group-hover/action:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                    >
                      <Link2 className="size-3" />
                    </button>
                  }
                />
              </span>
            ) : null}

            {data.email.trim() ? (
              <span className="inline-flex items-center gap-2">
                <span className="cursor-text text-[14px] font-semibold text-white/70 underline underline-offset-8">
                  <InlineText
                    value={data.email}
                    onChange={updateEmail}
                    placeholder="hello@simplycode.io"
                  />
                </span>
                <LinkUrlPopover
                  value={{
                    href: data.emailHref,
                    newTab: data.emailNewTab,
                    nofollow: data.emailNofollow,
                  }}
                  onPrepare={() => ({
                    href: data.emailHref,
                    newTab: data.emailNewTab,
                    nofollow: data.emailNofollow,
                  })}
                  onSave={(value) =>
                    update({
                      emailHref: value.href,
                      emailNewTab: value.newTab,
                      emailNofollow: value.nofollow,
                    })
                  }
                  title="Email link"
                  hint="Use mailto:hello@simplycode.io or a contact URL."
                  placeholder="mailto:hello@simplycode.io"
                  trigger={
                    <button
                      type="button"
                      title={`Edit link (${linkFieldSummary({
                        href: data.emailHref,
                        newTab: data.emailNewTab,
                        nofollow: data.emailNofollow,
                      })})`}
                      aria-label="Edit email link"
                      className="inline-flex size-6 items-center justify-center rounded-full bg-white/10 text-white/60 ring-1 ring-white/20 transition-colors hover:bg-white/20 hover:text-white focus-visible:bg-white/20 focus-visible:text-white data-[state=open]:bg-white/20 data-[state=open]:text-white"
                    >
                      <Link2 className="size-3.5" />
                    </button>
                  }
                />
              </span>
            ) : null}
          </div>
        }
      />
    </div>
  );
}
