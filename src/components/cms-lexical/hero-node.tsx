"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $applyNodeReplacement,
  $getNodeByKey,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  type ElementType,
  type ReactElement,
} from "react";
import { ArrowRight, Highlighter, Link2, Plus, X } from "lucide-react";
import {
  BlockDecoratorToolbar,
  ToolbarIconButton,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  DEFAULT_HERO,
  HERO_NODE_TYPE,
  normalizeHeroData,
  type HeroData,
  type HeroSurface,
  appendHeroButtonOrder,
  removeHeroButtonFromOrder,
  heroButtonsInDisplayOrder,
  heroSectionSurfaceClass,
  normalizeHeroSurface,
  type HeroStat,
} from "@/lib/cms/content";
import { LinkUrlPopover, linkFieldSummary } from "@/components/cms-lexical/link-url-popover";
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
  appChip,
  appHeroContainer,
  appOutlineButton,
  appPrimaryButtonMarketing,
} from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export type SerializedHeroNode = Spread<
  { data: HeroData },
  SerializedLexicalNode
>;

/**
 * Editable hero section. Content is edited directly on the canvas — click any
 * headline, description, buttons, tagline, panel badge, panel copy, and stats.
 */
export class HeroNode extends DecoratorNode<ReactElement> {
  __data: HeroData;

  static getType(): string {
    return HERO_NODE_TYPE;
  }

  static clone(node: HeroNode): HeroNode {
    return new HeroNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: SerializedHeroNode): HeroNode {
    return $createHeroNode(normalizeHeroData(serializedNode.data));
  }

  constructor(data?: HeroData, key?: NodeKey) {
    super(key);
    this.__data = normalizeHeroData(data);
  }

  exportJSON(): SerializedHeroNode {
    return {
      ...super.exportJSON(),
      type: HERO_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-hero-node";
    div.dataset.editorBlock = "hero";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  isKeyboardSelectable(): boolean {
    return false;
  }

  getData(): HeroData {
    return this.getLatest().__data;
  }

  setData(data: HeroData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return <HeroBlockEditor nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createHeroNode(data: HeroData = DEFAULT_HERO): HeroNode {
  return $applyNodeReplacement(new HeroNode(data));
}

export function $isHeroNode(
  node: LexicalNode | null | undefined,
): node is HeroNode {
  return node instanceof HeroNode;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function headlineHtml(headline: string, highlight: string): string {
  const accent = highlight.trim();
  const index = accent ? headline.indexOf(accent) : -1;

  if (index === -1) return escapeHtml(headline);

  return [
    escapeHtml(headline.slice(0, index)),
    `<span class="text-sc-accent-bright">${escapeHtml(accent)}</span>`,
    escapeHtml(headline.slice(index + accent.length)),
  ].join("");
}

/**
 * A plain-text editable region. The editor owns the DOM while focused so the
 * caret never jumps; external value changes sync when the field is blurred.
 */
function InlineText({
  value,
  onChange,
  as: Tag = "span",
  className,
  placeholder,
  multiline = false,
}: {
  value: string;
  onChange: (value: string) => void;
  as?: ElementType;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (document.activeElement === element) return;
    if (element.innerText !== value) element.innerText = value;
  }, [value]);

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={placeholder}
      data-placeholder={placeholder}
      spellCheck
      className={cn("content-inline-edit", className)}
      onInput={(event: React.FormEvent<HTMLElement>) =>
        onChange(
          multiline
            ? event.currentTarget.innerText
            : event.currentTarget.innerText.replace(/\n/g, " "),
        )
      }
      onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
        event.stopPropagation();
        if (event.key === "Escape") event.currentTarget.blur();
        if (!multiline && event.key === "Enter") event.preventDefault();
      }}
      onPaste={(event: React.ClipboardEvent<HTMLElement>) =>
        event.stopPropagation()
      }
    />
  );
}

const InlineHeadline = forwardRef<
  HTMLHeadingElement,
  {
    headline: string;
    highlight: string;
    onChange: (value: string) => void;
    onSelectionCapture?: () => void;
    className?: string;
  }
>(function InlineHeadline(
  { headline, highlight, onChange, onSelectionCapture, className },
  ref,
) {
  const innerRef = useRef<HTMLHeadingElement>(null);
  const setRef = (node: HTMLHeadingElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    const element = innerRef.current;
    if (!element) return;
    if (document.activeElement === element) return;
    const html = headlineHtml(headline, highlight);
    if (element.innerHTML !== html) element.innerHTML = html;
  }, [headline, highlight]);

  return (
    <h1
      ref={setRef}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Headline"
      data-placeholder="Headline"
      spellCheck
      className={cn("content-inline-edit", className)}
      onInput={(event) =>
        onChange(event.currentTarget.innerText.replace(/\n/g, " "))
      }
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape") event.currentTarget.blur();
        if (event.key === "Enter" && !event.shiftKey) event.preventDefault();
      }}
      onPaste={(event) => event.stopPropagation()}
      onMouseUp={() => onSelectionCapture?.()}
      onKeyUp={() => onSelectionCapture?.()}
    />
  );
});

function heroToolbarSelectClass() {
  return "h-7 min-w-0 max-w-[6.5rem] rounded border border-[#15130f]/15 bg-white px-2 text-[10px] font-semibold text-[#15130f] shadow-none focus-visible:ring-1 focus-visible:ring-sc-accent/40 focus-visible:outline-none";
}

function HeroBlockToolbarOptions({
  data,
  onApplyAccentFromSelection,
  onClearAccent,
  onSurfaceChange,
  onShowPanelChange,
}: {
  data: HeroData;
  onApplyAccentFromSelection: () => void;
  onClearAccent: () => void;
  onSurfaceChange: (surface: HeroSurface) => void;
  onShowPanelChange: (show: boolean) => void;
}) {
  return (
    <>
      <ToolbarIconButton
        label="Accent selected headline text"
        icon={Highlighter}
        fireOnMouseDown
        onClick={onApplyAccentFromSelection}
      />
      {data.highlight.trim() ? (
        <ToolbarIconButton
          label="Clear headline accent"
          icon={X}
          onClick={onClearAccent}
        />
      ) : null}
      <select
        aria-label="Hero background"
        title="Background"
        value={data.surface}
        onChange={(event) =>
          onSurfaceChange(normalizeHeroSurface(event.target.value))
        }
        className={heroToolbarSelectClass()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <option value="alt">Alt band</option>
        <option value="default">Default</option>
        <option value="canvas">Canvas</option>
      </select>
      <label
        className="flex cursor-pointer items-center gap-1 px-1 text-[9px] font-bold tracking-[0.12em] text-[#6f6a60] uppercase"
        title="Show dark stats panel"
      >
        <input
          type="checkbox"
          checked={data.showPanel !== false}
          onChange={(event) => onShowPanelChange(event.target.checked)}
          className="size-3.5 rounded border-[#15130f]/20"
          onMouseDown={(event) => event.stopPropagation()}
        />
        Panel
      </label>
    </>
  );
}

function EditableAction({
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

const HERO_PRIMARY_BUTTON_DEFAULTS = {
  primaryLabel: "Start Your Project",
  primaryHref: "#contact",
  primaryNewTab: false,
  primaryNofollow: false,
} as const;

const HERO_SECONDARY_BUTTON_DEFAULTS = {
  secondaryLabel: "View Our Work",
  secondaryHref: "/work",
  secondaryNewTab: false,
  secondaryNofollow: false,
} as const;

function HeroAddButtonDialog({
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
          className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase transition-colors hover:text-sc-accent"
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
                "min-w-[11rem] flex-1 justify-center bg-[#15130f] text-white hover:bg-sc-accent",
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
                "min-w-[11rem] flex-1 cursor-not-allowed justify-center gap-2 bg-sc-section text-sc-ink",
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
              className={cn(appOutlineButton, "min-w-[11rem] flex-1 justify-center gap-2")}
            >
              Outline button
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HeroStatEditor({
  stat,
  onUpdate,
  onRemove,
}: {
  stat: HeroStat;
  onUpdate: (patch: Partial<HeroStat>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="group/stat relative">
      <InlineText
        as="p"
        value={stat.value}
        placeholder="10+"
        onChange={(value) => onUpdate({ value })}
        className="text-sc-accent-bright text-[34px] leading-none font-black tracking-[-0.02em] lg:text-[40px]"
      />
      <InlineText
        as="p"
        value={stat.label}
        placeholder="Years building"
        onChange={(value) => onUpdate({ label: value })}
        className="mt-2.5 text-[10px] font-bold tracking-[0.16em] text-white/50 uppercase"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove stat"
        title="Remove stat"
        className="absolute -top-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-white/10 text-white/70 opacity-0 transition-opacity group-hover/stat:opacity-100 hover:bg-white/20 hover:text-white focus-visible:opacity-100"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

function HeroBlockEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: HeroData;
}) {
  const [editor] = useLexicalComposerContext();
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const headlineSelectionRef = useRef<Range | null>(null);

  const captureHeadlineSelection = () => {
    const el = headlineRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) {
      headlineSelectionRef.current = null;
      return;
    }
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) {
      headlineSelectionRef.current = null;
      return;
    }
    const text = sel.toString().trim();
    if (!text) {
      headlineSelectionRef.current = null;
      return;
    }
    headlineSelectionRef.current = range.cloneRange();
  };

  const readHeadlineSelectedText = (): string => {
    const el = headlineRef.current;
    if (!el) return "";

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (el.contains(range.commonAncestorContainer)) {
        const live = sel.toString().trim();
        if (live) return live;
      }
    }

    const saved = headlineSelectionRef.current;
    if (saved && el.contains(saved.commonAncestorContainer)) {
      return saved.toString().trim();
    }

    return "";
  };

  const update = (patch: Partial<HeroData>) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isHeroNode(node)) node.setData({ ...node.getData(), ...patch });
    });
  };

  const updateStat = (index: number, patch: Partial<HeroStat>) => {
    const stats = data.stats.map((stat, statIndex) =>
      statIndex === index ? { ...stat, ...patch } : stat,
    );
    update({ stats });
  };

  const addStat = () =>
    update({ stats: [...data.stats, { value: "", label: "" }] });

  const removeStat = (index: number) =>
    update({
      stats: data.stats.filter((_, statIndex) => statIndex !== index),
    });

  const applyAccentFromSelection = () => {
    const headlineEl = headlineRef.current;
    if (!headlineEl) return;

    const selectedText = readHeadlineSelectedText();
    if (!selectedText) return;

    const headlineText = headlineEl.innerText.replace(/\n/g, " ");
    if (!headlineText.includes(selectedText)) return;

    const currentAccent = data.highlight.trim();
    const nextHighlight =
      selectedText === currentAccent ? "" : selectedText;

    headlineEl.blur();
    headlineSelectionRef.current = null;
    update({
      headline: headlineText,
      highlight: nextHighlight,
    });
  };

  const onHeadlineChange = (value: string) => {
    const patch: Partial<HeroData> = { headline: value };
    const accent = data.highlight.trim();
    if (accent && !value.includes(accent)) {
      patch.highlight = "";
    }
    update(patch);
  };

  const remove = () => {
    editor.update(() => {
      $getNodeByKey(nodeKey)?.remove();
    });
  };

  const stats = data.stats;
  const hasPrimary = data.primaryLabel.trim().length > 0;
  const hasSecondary = data.secondaryLabel.trim().length > 0;
  const canAddButton = !hasPrimary || !hasSecondary;

  const addPrimaryButton = () =>
    update({
      ...HERO_PRIMARY_BUTTON_DEFAULTS,
      primaryLabel:
        data.primaryLabel.trim() || HERO_PRIMARY_BUTTON_DEFAULTS.primaryLabel,
      primaryHref:
        data.primaryHref.trim() || HERO_PRIMARY_BUTTON_DEFAULTS.primaryHref,
      buttonOrder: appendHeroButtonOrder(data.buttonOrder, "primary"),
    });

  const addSecondaryButton = () =>
    update({
      ...HERO_SECONDARY_BUTTON_DEFAULTS,
      secondaryLabel:
        data.secondaryLabel.trim() ||
        HERO_SECONDARY_BUTTON_DEFAULTS.secondaryLabel,
      secondaryHref:
        data.secondaryHref.trim() ||
        HERO_SECONDARY_BUTTON_DEFAULTS.secondaryHref,
      buttonOrder: appendHeroButtonOrder(data.buttonOrder, "secondary"),
    });

  const removePrimaryButton = () =>
    update({
      primaryLabel: "",
      buttonOrder: removeHeroButtonFromOrder(data.buttonOrder, "primary"),
    });
  const removeSecondaryButton = () =>
    update({
      secondaryLabel: "",
      buttonOrder: removeHeroButtonFromOrder(data.buttonOrder, "secondary"),
    });

  const buttonOrder = heroButtonsInDisplayOrder(data);
  const showPanel = data.showPanel !== false;

  return (
    <div
      contentEditable={false}
      data-editor-block="hero"
      className="group/block text-sc-ink relative"
    >
      <BlockDecoratorToolbar label="Hero" onRemove={remove}>
        <div className="flex max-w-[min(72vw,540px)] flex-wrap items-center gap-1">
          <HeroBlockToolbarOptions
            data={data}
            onApplyAccentFromSelection={applyAccentFromSelection}
            onClearAccent={() => update({ highlight: "" })}
            onSurfaceChange={(surface) => update({ surface })}
            onShowPanelChange={(showPanel) => update({ showPanel })}
          />
        </div>
      </BlockDecoratorToolbar>

      <section
        className={cn(
          "relative overflow-hidden border-b border-[#15130f]/10",
          heroSectionSurfaceClass(data.surface),
        )}
      >
        <div className={cn(appHeroContainer, "px-6 py-14 lg:py-20")}>
          <div
            className={cn(
              "grid items-center gap-12",
              showPanel && "lg:grid-cols-[1.1fr_0.9fr] lg:gap-16",
            )}
          >
            <div>
              <div
                className={cn(
                  appChip,
                  "inline-flex items-center gap-2.5 px-3.5 py-2",
                )}
              >
                <span
                  aria-hidden
                  className="bg-sc-accent-bright size-1.5 rounded-full"
                />
                <InlineText
                  as="p"
                  value={data.eyebrow}
                  onChange={(value) => update({ eyebrow: value })}
                  placeholder="Web Development Agency"
                  className="text-sc-accent text-[10px] font-bold tracking-[0.22em] uppercase"
                />
              </div>

              <InlineHeadline
                ref={headlineRef}
                headline={data.headline}
                highlight={data.highlight}
                onChange={onHeadlineChange}
                onSelectionCapture={captureHeadlineSelection}
                className="mt-7 max-w-[26ch] text-[clamp(2.1rem,4vw,3.35rem)] leading-[1.06] font-black tracking-[-0.03em] uppercase"
              />

              <InlineText
                as="p"
                multiline
                value={data.description}
                onChange={(value) => update({ description: value })}
                placeholder="Describe what you offer…"
                className="mt-6 max-w-[34rem] text-[16px] leading-[1.7] whitespace-pre-wrap text-[#57524a]"
              />

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {buttonOrder.map((slot) =>
                  slot === "primary" ? (
                    <EditableAction
                      key="primary"
                      primary
                      label={data.primaryLabel}
                      link={{
                        href: data.primaryHref,
                        newTab: data.primaryNewTab,
                        nofollow: data.primaryNofollow,
                      }}
                      onChangeLabel={(value) =>
                        update({ primaryLabel: value })
                      }
                      onChangeLink={(value) =>
                        update({
                          primaryHref: value.href,
                          primaryNewTab: value.newTab,
                          primaryNofollow: value.nofollow,
                        })
                      }
                      onRemove={removePrimaryButton}
                    />
                  ) : (
                    <EditableAction
                      key="secondary"
                      label={data.secondaryLabel}
                      link={{
                        href: data.secondaryHref,
                        newTab: data.secondaryNewTab,
                        nofollow: data.secondaryNofollow,
                      }}
                      onChangeLabel={(value) =>
                        update({ secondaryLabel: value })
                      }
                      onChangeLink={(value) =>
                        update({
                          secondaryHref: value.href,
                          secondaryNewTab: value.newTab,
                          secondaryNofollow: value.nofollow,
                        })
                      }
                      onRemove={removeSecondaryButton}
                    />
                  ),
                )}
                {canAddButton ? (
                  <HeroAddButtonDialog
                    hasPrimary={hasPrimary}
                    hasSecondary={hasSecondary}
                    onAddPrimary={addPrimaryButton}
                    onAddSecondary={addSecondaryButton}
                  />
                ) : null}
              </div>

              <InlineText
                as="p"
                value={data.tagline}
                onChange={(value) => update({ tagline: value })}
                placeholder="From first contact to production deploy"
                className="border-sc-accent-bright text-sc-muted mt-9 border-l-2 pl-4 text-[11px] leading-relaxed font-bold tracking-[0.14em] uppercase"
              />
            </div>

            {showPanel ? (
            <div className="relative overflow-hidden rounded-lg bg-[#15130f] p-7 text-white shadow-[0_8px_32px_rgba(21,19,15,0.18)] lg:p-9">
              <div
                aria-hidden
                className="bg-sc-accent-bright/25 pointer-events-none absolute -top-16 -right-16 size-48 rounded-full blur-3xl"
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="bg-sc-accent-bright px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#15130f] uppercase">
                    <InlineText
                      value={data.badge}
                      onChange={(value) => update({ badge: value })}
                      placeholder="Since 2016"
                    />
                  </span>
                </div>

                <InlineText
                  as="p"
                  multiline
                  value={data.panelText}
                  onChange={(value) => update({ panelText: value })}
                  placeholder="Short statement about your work…"
                  className="mt-8 max-w-[24ch] text-[17px] leading-snug font-black tracking-tight whitespace-pre-wrap text-white uppercase lg:text-[19px]"
                />

                {stats.length > 0 ? (
                  <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/10 pt-8">
                    {stats.map((stat, index) => (
                      <HeroStatEditor
                        key={index}
                        stat={stat}
                        onUpdate={(patch) => updateStat(index, patch)}
                        onRemove={() => removeStat(index)}
                      />
                    ))}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={addStat}
                  className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-white/40 uppercase transition-colors hover:text-white"
                >
                  <Plus className="size-3.5" /> Add stat
                </button>
              </div>
            </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
