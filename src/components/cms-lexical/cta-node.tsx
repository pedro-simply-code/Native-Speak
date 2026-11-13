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
import { type ReactElement } from "react";
import { CtaMarketingSection } from "@/components/cms-content/cta-marketing-section";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionCheckbox,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  LinkUrlPopover,
  linkFieldSummary,
} from "@/components/cms-lexical/link-url-popover";
import {
  CTA_SECTION_NODE_TYPE,
  DEFAULT_CTA_SECTION,
  normalizeCtaSectionData,
  type CtaSectionData,
} from "@/lib/cms/homepage-sections";
import type { LinkFieldValue } from "@/lib/cms/link-options";
import { appPrimaryButtonMarketingLg } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export type SerializedCtaSectionNode = Spread<
  { data: CtaSectionData },
  SerializedLexicalNode
>;

export class CtaSectionNode extends DecoratorNode<ReactElement> {
  __data: CtaSectionData;

  static getType(): string {
    return CTA_SECTION_NODE_TYPE;
  }

  static clone(node: CtaSectionNode): CtaSectionNode {
    return new CtaSectionNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: SerializedCtaSectionNode): CtaSectionNode {
    return $createCtaSectionNode(normalizeCtaSectionData(serializedNode.data));
  }

  constructor(data?: CtaSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeCtaSectionData(data);
  }

  exportJSON(): SerializedCtaSectionNode {
    return {
      ...super.exportJSON(),
      type: CTA_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-cta-node";
    div.dataset.editorBlock = "cta";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): CtaSectionData {
    return this.getLatest().__data;
  }

  setData(data: CtaSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return <CtaSectionEditor nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createCtaSectionNode(
  data: CtaSectionData = DEFAULT_CTA_SECTION,
): CtaSectionNode {
  return $applyNodeReplacement(new CtaSectionNode(data));
}

export function $isCtaSectionNode(
  node: LexicalNode | null | undefined,
): node is CtaSectionNode {
  return node instanceof CtaSectionNode;
}

function CtaSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: CtaSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(nodeKey, $isCtaSectionNode);

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="cta"
    >
      <BlockDecoratorToolbar label="CTA" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Marketing CTA"
          description="Choose which contact details appear. Edit headline, button, and email on the canvas."
        >
          <SectionOptionCheckbox
            label="Show email link"
            checked={data.showEmail}
            onChange={(checked) => update({ showEmail: checked })}
          />
          <SectionOptionCheckbox
            label="Show response note"
            checked={data.showResponseNote}
            onChange={(checked) => update({ showResponseNote: checked })}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <CtaMarketingSection
        data={data}
        headlineOverride={
          <InlineText
            as="h2"
            multiline
            value={data.headline}
            onChange={(v) => update({ headline: v })}
            className="max-w-3xl text-[clamp(2rem,4.8vw,3.6rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase"
          />
        }
        descriptionOverride={
          <InlineText
            as="p"
            multiline
            value={data.description}
            onChange={(v) => update({ description: v })}
            className="mt-6 max-w-xl text-[16px] leading-relaxed text-[#57524a]"
          />
        }
        actionsOverride={
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <span className="group/action relative inline-flex">
              <span className={cn(appPrimaryButtonMarketingLg, "cursor-text")}>
                <InlineText
                  value={data.buttonLabel}
                  onChange={(v) => update({ buttonLabel: v })}
                  placeholder="Start Your Project"
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
                onSave={(value: LinkFieldValue) =>
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
                    className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full bg-[#15130f] text-white opacity-0 shadow-md transition-opacity group-hover/action:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                  >
                    <Link2 className="size-3" />
                  </button>
                }
              />
            </span>
            {data.showEmail && data.email.trim() ? (
              <span className="inline-flex items-center gap-2">
                <span className="cursor-text text-[14px] font-semibold text-[#15130f] underline underline-offset-8">
                  <InlineText
                    value={data.email}
                    onChange={(email) =>
                      update({
                        email,
                        emailHref:
                          data.emailHref === `mailto:${data.email}`
                            ? `mailto:${email}`
                            : data.emailHref,
                      })
                    }
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
                      className="inline-flex size-6 items-center justify-center rounded-full bg-[#15130f]/5 text-[#6f6a60] ring-1 ring-[#15130f]/15 transition-colors hover:bg-[#15130f] hover:text-white focus-visible:bg-[#15130f] focus-visible:text-white data-[state=open]:bg-[#15130f] data-[state=open]:text-white"
                    >
                      <Link2 className="size-3.5" />
                    </button>
                  }
                />
              </span>
            ) : null}
            {data.showResponseNote && data.responseNote.trim() ? (
              <InlineText
                value={data.responseNote}
                onChange={(v) => update({ responseNote: v })}
                className="text-[12px] tracking-[0.12em] text-[#6f6a60] uppercase"
              />
            ) : null}
          </div>
        }
      />
    </div>
  );
}
