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
import { useState, type ReactElement } from "react";
import { PageIntroSection } from "@/components/cms-content/page-intro-section";
import {
  BlockDecoratorToolbar,
  InlineText,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  LinkUrlPopover,
  linkFieldSummary,
} from "@/components/cms-lexical/link-url-popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { LinkFieldValue } from "@/lib/cms/link-options";
import {
  DEFAULT_PAGE_INTRO_SECTION,
  normalizePageIntroSectionData,
  PAGE_INTRO_SECTION_NODE_TYPE,
  type PageIntroSectionData,
  type PageIntroStat,
} from "@/lib/cms/site-page-sections";
import {
  appOutlineButton,
  appPanel,
  appPrimaryButtonMarketing,
} from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export type SerializedPageIntroSectionNode = Spread<
  { data: PageIntroSectionData },
  SerializedLexicalNode
>;

export class PageIntroSectionNode extends DecoratorNode<ReactElement> {
  __data: PageIntroSectionData;

  static getType(): string {
    return PAGE_INTRO_SECTION_NODE_TYPE;
  }

  static clone(node: PageIntroSectionNode): PageIntroSectionNode {
    return new PageIntroSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedPageIntroSectionNode,
  ): PageIntroSectionNode {
    return $createPageIntroSectionNode(
      normalizePageIntroSectionData(serializedNode.data),
    );
  }

  constructor(data?: PageIntroSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizePageIntroSectionData(data);
  }

  exportJSON(): SerializedPageIntroSectionNode {
    return {
      ...super.exportJSON(),
      type: PAGE_INTRO_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-page-intro-node";
    div.dataset.editorBlock = "page-intro";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): PageIntroSectionData {
    return this.getLatest().__data;
  }

  setData(data: PageIntroSectionData): this {
    const writable = this.getWritable();
    writable.__data = normalizePageIntroSectionData(data);
    return writable;
  }

  decorate(): ReactElement {
    return (
      <PageIntroSectionEditor nodeKey={this.getKey()} data={this.__data} />
    );
  }
}

export function $createPageIntroSectionNode(
  data: PageIntroSectionData = DEFAULT_PAGE_INTRO_SECTION,
): PageIntroSectionNode {
  return $applyNodeReplacement(new PageIntroSectionNode(data));
}

export function $isPageIntroSectionNode(
  node: LexicalNode | null | undefined,
): node is PageIntroSectionNode {
  return node instanceof PageIntroSectionNode;
}

function IntroAction({
  label,
  link,
  onChangeLabel,
  onChangeLink,
  onRemove,
  primary,
}: {
  label: string;
  link: LinkFieldValue;
  onChangeLabel: (value: string) => void;
  onChangeLink: (value: LinkFieldValue) => void;
  onRemove: () => void;
  primary?: boolean;
}) {
  return (
    <span className="group/action relative inline-flex">
      <span
        className={cn(
          "cursor-text",
          primary ? appPrimaryButtonMarketing : cn("gap-2", appOutlineButton),
        )}
      >
        <InlineText
          value={label}
          onChange={onChangeLabel}
          placeholder={primary ? "Primary button" : "Secondary button"}
        />
        {primary ? <ArrowRight className="size-4" /> : null}
      </span>
      <LinkUrlPopover
        value={link}
        onSave={onChangeLink}
        title="Button link"
        placeholder="/contact or https://…"
        trigger={
          <button
            type="button"
            title={`Edit link (${linkFieldSummary(link)})`}
            aria-label="Edit button link"
            className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full bg-[#15130f] text-white opacity-0 shadow-md transition-opacity group-hover/action:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
          >
            <Link2 className="size-3" />
          </button>
        }
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove button"
        title="Remove button"
        className="absolute -top-2 -left-2 inline-flex size-5 items-center justify-center rounded-full bg-[#15130f]/90 text-white/80 opacity-0 shadow-sm transition-opacity group-hover/action:opacity-100 hover:bg-[#15130f] hover:text-white focus-visible:opacity-100"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

const INTRO_PRIMARY_DEFAULTS = {
  primaryLabel: "Work With Us",
  primaryHref: "/contact",
  primaryNewTab: false,
  primaryNofollow: false,
} as const;

const INTRO_SECONDARY_DEFAULTS = {
  secondaryLabel: "See Our Work",
  secondaryHref: "/work",
  secondaryNewTab: false,
  secondaryNofollow: false,
  showSecondary: true,
} as const;

function IntroAddButtonDialog({
  hasPrimary,
  hasSecondary,
  onAddPrimary,
  onAddSecondary,
}: {
  hasPrimary: boolean;
  hasSecondary: boolean;
  onAddPrimary: () => void;
  onAddSecondary: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="hover:text-sc-accent inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase transition-colors"
        >
          <Plus className="size-3.5" /> Add button
        </button>
      </DialogTrigger>
      <DialogContent
        className="border-0 bg-white p-6 text-[#15130f] shadow-[0_8px_32px_rgba(21,19,15,0.14)] sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-base font-black tracking-tight text-[#15130f] uppercase">
            Add a button
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-[#57524a]">
            Primary (filled) or outline — same styles as the hero.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-3 pt-2">
          {hasPrimary ? (
            <div
              aria-disabled
              className={cn(
                appPrimaryButtonMarketing,
                "min-w-[11rem] flex-1 cursor-not-allowed justify-center bg-[#15130f] text-white",
              )}
            >
              Primary button <ArrowRight className="size-4" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onAddPrimary();
                setOpen(false);
              }}
              className={cn(
                appPrimaryButtonMarketing,
                "hover:bg-sc-accent min-w-[11rem] flex-1 justify-center bg-[#15130f] text-white",
              )}
            >
              Primary button <ArrowRight className="size-4" />
            </button>
          )}
          {hasSecondary ? (
            <div
              aria-disabled
              className={cn(
                appOutlineButton,
                "bg-sc-section text-sc-ink min-w-[11rem] flex-1 cursor-not-allowed justify-center gap-2",
              )}
            >
              Outline button
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onAddSecondary();
                setOpen(false);
              }}
              className={cn(
                appOutlineButton,
                "min-w-[11rem] flex-1 justify-center gap-2",
              )}
            >
              Outline button
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IntroStatEditor({
  stat,
  onUpdate,
  onRemove,
}: {
  stat: PageIntroStat;
  onUpdate: (patch: Partial<PageIntroStat>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="group/stat relative">
      <InlineText
        as="dt"
        value={stat.label}
        onChange={(label) => onUpdate({ label })}
        placeholder="Label"
        className="text-[10px] font-bold tracking-[0.16em] text-[#6f6a60] uppercase"
      />
      <InlineText
        as="dd"
        value={stat.value}
        onChange={(value) => onUpdate({ value })}
        placeholder="0"
        className="mt-1 text-[34px] leading-none font-black tracking-[-0.02em] text-[#15130f]"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove stat"
        title="Remove stat"
        className="absolute -top-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-[#15130f]/10 text-[#6f6a60] opacity-0 transition-opacity group-hover/stat:opacity-100 hover:bg-[#15130f] hover:text-white focus-visible:opacity-100"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

function PageIntroSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: PageIntroSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isPageIntroSectionNode,
  );

  const updateStat = (index: number, patch: Partial<PageIntroStat>) => {
    update({
      stats: data.stats.map((stat, statIndex) =>
        statIndex === index ? { ...stat, ...patch } : stat,
      ),
    });
  };

  const addStat = () =>
    update({ stats: [...data.stats, { value: "", label: "" }] });

  const removeStat = (index: number) =>
    update({
      stats: data.stats.filter((_, statIndex) => statIndex !== index),
    });

  const updatePanelEmail = (panelEmail: string) => {
    update({
      panelEmail,
      panelEmailHref:
        data.panelEmailHref === `mailto:${data.panelEmail}`
          ? `mailto:${panelEmail}`
          : data.panelEmailHref,
    });
  };

  const hasPrimary = data.primaryLabel.trim().length > 0;
  const hasSecondary =
    data.showSecondary && data.secondaryLabel.trim().length > 0;
  const canAddButton = !hasPrimary || !hasSecondary;

  const addPrimaryButton = () =>
    update({
      ...INTRO_PRIMARY_DEFAULTS,
      primaryLabel:
        data.primaryLabel.trim() || INTRO_PRIMARY_DEFAULTS.primaryLabel,
      primaryHref:
        data.primaryHref.trim() || INTRO_PRIMARY_DEFAULTS.primaryHref,
    });

  const addSecondaryButton = () =>
    update({
      ...INTRO_SECONDARY_DEFAULTS,
      secondaryLabel:
        data.secondaryLabel.trim() || INTRO_SECONDARY_DEFAULTS.secondaryLabel,
      secondaryHref:
        data.secondaryHref.trim() || INTRO_SECONDARY_DEFAULTS.secondaryHref,
    });

  const removePrimaryButton = () => update({ primaryLabel: "" });
  const removeSecondaryButton = () =>
    update({ secondaryLabel: "", showSecondary: false });

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="page-intro"
    >
      <BlockDecoratorToolbar label="Page intro" onRemove={remove} />
      <PageIntroSection
        data={data}
        contentOverride={
          <div>
            <InlineText
              as="p"
              value={data.eyebrow}
              onChange={(eyebrow) => update({ eyebrow })}
              placeholder="About Simply Code"
              className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
            />
            <InlineText
              as="h1"
              multiline
              value={data.headline}
              onChange={(headline) => update({ headline })}
              placeholder={"A Small Team,\nSenior Delivery"}
              className="mt-5 text-[clamp(2.5rem,5.6vw,4.6rem)] leading-[0.98] font-black tracking-[-0.045em] whitespace-pre-line uppercase"
            />
            <InlineText
              as="p"
              multiline
              value={data.body}
              onChange={(body) => update({ body })}
              placeholder="Introduce the studio…"
              className="mt-6 max-w-2xl text-[17px] leading-relaxed whitespace-pre-wrap text-[#57524a]"
            />
            <InlineText
              as="p"
              multiline
              value={data.bodySecondary}
              onChange={(bodySecondary) => update({ bodySecondary })}
              placeholder="Optional supporting paragraph"
              className="mt-4 max-w-2xl text-[15px] leading-relaxed whitespace-pre-wrap text-[#57524a]"
            />

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {hasPrimary ? (
                <IntroAction
                  primary
                  label={data.primaryLabel}
                  link={{
                    href: data.primaryHref,
                    newTab: data.primaryNewTab,
                    nofollow: data.primaryNofollow,
                  }}
                  onChangeLabel={(primaryLabel) => update({ primaryLabel })}
                  onChangeLink={(value) =>
                    update({
                      primaryHref: value.href,
                      primaryNewTab: value.newTab,
                      primaryNofollow: value.nofollow,
                    })
                  }
                  onRemove={removePrimaryButton}
                />
              ) : null}

              {hasSecondary ? (
                <IntroAction
                  label={data.secondaryLabel}
                  link={{
                    href: data.secondaryHref,
                    newTab: data.secondaryNewTab,
                    nofollow: data.secondaryNofollow,
                  }}
                  onChangeLabel={(secondaryLabel) => update({ secondaryLabel })}
                  onChangeLink={(value) =>
                    update({
                      secondaryHref: value.href,
                      secondaryNewTab: value.newTab,
                      secondaryNofollow: value.nofollow,
                    })
                  }
                  onRemove={removeSecondaryButton}
                />
              ) : null}

              {canAddButton ? (
                <IntroAddButtonDialog
                  hasPrimary={hasPrimary}
                  hasSecondary={hasSecondary}
                  onAddPrimary={addPrimaryButton}
                  onAddSecondary={addSecondaryButton}
                />
              ) : null}
            </div>
          </div>
        }
        panelOverride={
          <div className={cn(appPanel, "p-8 lg:p-10")}>
            <InlineText
              as="p"
              value={data.panelEyebrow}
              onChange={(panelEyebrow) => update({ panelEyebrow })}
              placeholder="At a glance"
              className="text-sc-accent text-[11px] font-bold tracking-[0.22em] uppercase"
            />
            {data.stats.length > 0 ? (
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8">
                {data.stats.map((stat, index) => (
                  <IntroStatEditor
                    key={index}
                    stat={stat}
                    onUpdate={(patch) => updateStat(index, patch)}
                    onRemove={() => removeStat(index)}
                  />
                ))}
              </dl>
            ) : null}
            <button
              type="button"
              onClick={addStat}
              className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase transition-colors hover:text-[#15130f]"
            >
              <Plus className="size-3.5" /> Add stat
            </button>
            <div className="mt-8 space-y-1.5 border-t border-[#15130f]/10 pt-6 text-[13px] text-[#57524a]">
              <InlineText
                as="p"
                value={data.panelFooter}
                onChange={(panelFooter) => update({ panelFooter })}
                placeholder="City, Country"
              />
              {data.panelEmail.trim() ? (
                <span className="inline-flex items-center gap-2">
                  <InlineText
                    value={data.panelEmail}
                    onChange={updatePanelEmail}
                    placeholder="hello@simplycode.io"
                  />
                  <LinkUrlPopover
                    value={{
                      href: data.panelEmailHref,
                      newTab: data.panelEmailNewTab,
                      nofollow: data.panelEmailNofollow,
                    }}
                    onPrepare={() => ({
                      href: data.panelEmailHref,
                      newTab: data.panelEmailNewTab,
                      nofollow: data.panelEmailNofollow,
                    })}
                    onSave={(value) =>
                      update({
                        panelEmailHref: value.href,
                        panelEmailNewTab: value.newTab,
                        panelEmailNofollow: value.nofollow,
                      })
                    }
                    title="Email link"
                    hint="Use mailto:hello@simplycode.io or a contact URL."
                    placeholder="mailto:hello@simplycode.io"
                    trigger={
                      <button
                        type="button"
                        title={`Edit link (${linkFieldSummary({
                          href: data.panelEmailHref,
                          newTab: data.panelEmailNewTab,
                          nofollow: data.panelEmailNofollow,
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
            </div>
          </div>
        }
      />
    </div>
  );
}
