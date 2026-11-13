"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import {
  Link2,
  Pencil,
  Plus,
  Settings2,
  X,
} from "lucide-react";
import { createElement, useState, type ReactElement } from "react";
import {
  CONTACT_DETAIL_ICON_OPTIONS,
  ContactSection,
  contactDetailIcon,
} from "@/components/cms-content/contact-section";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionCheckbox,
  SectionOptionSelect,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  LinkUrlPopover,
  linkFieldSummary,
} from "@/components/cms-lexical/link-url-popover";
import {
  CONTACT_SECTION_NODE_TYPE,
  DEFAULT_CONTACT_SECTION,
  normalizeContactSectionData,
  type ContactDetailItem,
  type ContactSectionData,
} from "@/lib/cms/homepage-sections";
import type { LinkFieldValue } from "@/lib/cms/link-options";
import { appPanel } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export type SerializedContactSectionNode = Spread<
  { data: ContactSectionData },
  SerializedLexicalNode
>;

export class ContactSectionNode extends DecoratorNode<ReactElement> {
  __data: ContactSectionData;

  static getType(): string {
    return CONTACT_SECTION_NODE_TYPE;
  }

  static clone(node: ContactSectionNode): ContactSectionNode {
    return new ContactSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedContactSectionNode,
  ): ContactSectionNode {
    return $createContactSectionNode(
      normalizeContactSectionData(serializedNode.data),
    );
  }

  constructor(data?: ContactSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeContactSectionData(data);
  }

  exportJSON(): SerializedContactSectionNode {
    return {
      ...super.exportJSON(),
      type: CONTACT_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-contact-node";
    div.dataset.editorBlock = "contact";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): ContactSectionData {
    return this.getLatest().__data;
  }

  setData(data: ContactSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return (
      <ContactSectionEditor nodeKey={this.getKey()} data={this.__data} />
    );
  }
}

export function $createContactSectionNode(
  data: ContactSectionData = DEFAULT_CONTACT_SECTION,
): ContactSectionNode {
  return $applyNodeReplacement(new ContactSectionNode(data));
}

export function $isContactSectionNode(
  node: LexicalNode | null | undefined,
): node is ContactSectionNode {
  return node instanceof ContactSectionNode;
}

const ICON_OPTIONS = [
  ...CONTACT_DETAIL_ICON_OPTIONS,
  { key: "none", label: "No icon", icon: null as null },
];

function ContactDetailIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = contactDetailIcon(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Change icon"
          aria-label="Change icon"
          className="text-sc-accent-bright group/icon relative flex size-10 shrink-0 items-center justify-center bg-[#15130f] transition-shadow hover:ring-2 hover:ring-[#15130f]/30"
        >
          {Icon ? (
            createElement(Icon, { className: "size-4" })
          ) : (
            <span className="text-[9px] font-bold tracking-wider text-white/50 uppercase">
              —
            </span>
          )}
          <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-white text-[#15130f] opacity-0 shadow-sm transition-opacity group-hover/icon:opacity-100 focus-visible:opacity-100">
            <Pencil className="size-2.5" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-[15rem] border border-[#15130f]/10 bg-white p-3"
      >
        <p className="text-[10px] font-bold tracking-[0.14em] text-[#57524a] uppercase">
          Icon
        </p>
        <div className="mt-2 grid grid-cols-5 gap-1">
          {ICON_OPTIONS.map((option) => {
            const active = option.key === value;
            return (
              <button
                key={option.key}
                type="button"
                title={option.label}
                aria-label={option.label}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                }}
                className={cn(
                  "flex size-9 items-center justify-center rounded text-[10px] font-bold transition-colors",
                  active
                    ? "bg-[#15130f] text-white hover:bg-[#15130f]"
                    : "text-[#57524a] hover:bg-[#15130f]/5",
                )}
              >
                {option.icon
                  ? createElement(option.icon, { className: "size-4" })
                  : "—"}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FaqLinkEditor({
  data,
  update,
}: {
  data: ContactSectionData;
  update: (patch: Partial<ContactSectionData>) => void;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <InlineText
        value={data.faqLabel}
        onChange={(v) => update({ faqLabel: v })}
        className="text-[11px] font-bold tracking-[0.16em] uppercase underline underline-offset-4"
      />
      <LinkUrlPopover
        value={{
          href: data.faqHref,
          newTab: data.faqNewTab,
          nofollow: false,
        }}
        onPrepare={() => ({
          href: data.faqHref,
          newTab: data.faqNewTab,
          nofollow: false,
        })}
        onSave={(value: LinkFieldValue) =>
          update({ faqHref: value.href, faqNewTab: value.newTab })
        }
        trigger={
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded border bg-white"
            aria-label="Edit FAQ link"
          >
            <Link2 className="size-4" />
          </button>
        }
      />
    </div>
  );
}

function AddContactDetailMenu({
  disabled,
  onAdd,
}: {
  disabled: boolean;
  onAdd: (valueType: "text" | "link") => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase transition-colors hover:text-[#15130f] disabled:opacity-40"
        >
          <Plus className="size-3.5" /> Add detail
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[11.5rem] border border-[#15130f]/10 bg-white p-2"
      >
        <p className="px-1 pb-2 text-[10px] font-bold tracking-[0.14em] text-[#57524a] uppercase">
          Add as
        </p>
        <button
          type="button"
          onClick={() => {
            onAdd("text");
            setOpen(false);
          }}
          className="hover:bg-sc-section-alt w-full rounded px-2 py-2 text-left text-[13px] text-[#15130f]"
        >
          Text
        </button>
        <button
          type="button"
          onClick={() => {
            onAdd("link");
            setOpen(false);
          }}
          className="hover:bg-sc-section-alt w-full rounded px-2 py-2 text-left text-[13px] text-[#15130f]"
        >
          Link
        </button>
      </PopoverContent>
    </Popover>
  );
}

function ContactSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: ContactSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isContactSectionNode,
  );
  const isPage = data.layout === "page";

  const patchDetails = (next: ContactDetailItem[]) => {
    update({ contactDetails: next.slice(0, 12) });
  };

  const updateDetail = (
    index: number,
    patch: Partial<ContactDetailItem>,
  ) => {
    patchDetails(
      data.contactDetails.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const removeDetail = (index: number) => {
    patchDetails(data.contactDetails.filter((_, i) => i !== index));
  };

  const addDetail = (valueType: ContactDetailItem["valueType"]) => {
    if (data.contactDetails.length >= 12) return;
    const isLink = valueType === "link";
    patchDetails([
      ...data.contactDetails,
      {
        label: "Detail",
        value: isLink ? "hello@simplycode.io" : "Your text here",
        href: isLink ? "mailto:hello@simplycode.io" : "",
        icon: isLink ? "mail" : "none",
        valueType,
      },
    ]);
  };

  const patchSteps = (next: string[]) => {
    update({ nextSteps: next.slice(0, 12) });
  };

  const updateStep = (index: number, value: string) => {
    patchSteps(data.nextSteps.map((step, i) => (i === index ? value : step)));
  };

  const removeStep = (index: number) => {
    patchSteps(data.nextSteps.filter((_, i) => i !== index));
  };

  const addStep = () => {
    if (data.nextSteps.length >= 12) return;
    patchSteps([
      ...data.nextSteps,
      `${data.nextSteps.length + 1}. New step`,
    ]);
  };

  const introFields = (
    <>
      <InlineText
        as="p"
        value={data.eyebrow}
        onChange={(v) => update({ eyebrow: v })}
        className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
      />
      <InlineText
        as={isPage ? "h1" : "h2"}
        multiline
        value={data.headline}
        onChange={(v) => update({ headline: v })}
        className={
          isPage
            ? "mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase"
            : "mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase"
        }
      />
      <InlineText
        as="p"
        multiline
        value={data.description}
        onChange={(v) => update({ description: v })}
        className="mt-6 max-w-xl text-[16px] leading-relaxed text-[#57524a]"
      />
      {!isPage ? <FaqLinkEditor data={data} update={update} /> : null}
    </>
  );

  const detailsOverride = isPage ? (
    <div className="mt-10">
      {data.contactDetails.length > 0 ? (
        <ul className="space-y-5">
          {data.contactDetails.map((item, index) => (
            <li
              key={`detail-${index}`}
              className="group/detail relative flex items-start gap-4"
            >
              <ContactDetailIconPicker
                value={item.icon}
                onChange={(icon) => updateDetail(index, { icon })}
              />
              <div className="min-w-0 flex-1 pr-8">
                <InlineText
                  as="p"
                  value={item.label}
                  onChange={(v) => updateDetail(index, { label: v })}
                  className="block text-[11px] font-bold tracking-[0.18em] text-[#6f6a60] uppercase"
                />
                {item.valueType === "link" ? (
                  <div className="group/value mt-1 inline-flex max-w-xl items-start gap-1.5">
                    <InlineText
                      as="p"
                      multiline
                      value={item.value}
                      onChange={(v) => updateDetail(index, { value: v })}
                      className="min-w-0 whitespace-pre-wrap text-[15px] font-semibold text-[#15130f] underline underline-offset-4"
                    />
                    <LinkUrlPopover
                      value={{
                        href: item.href,
                        newTab: false,
                        nofollow: false,
                      }}
                      onPrepare={() => ({
                        href: item.href,
                        newTab: false,
                        nofollow: false,
                      })}
                      onSave={(value) =>
                        updateDetail(index, { href: value.href })
                      }
                      title="Detail link"
                      hint="Where this line should navigate."
                      placeholder="mailto:hello@… or /path"
                      trigger={
                        <button
                          type="button"
                          title={`Edit link (${linkFieldSummary({ href: item.href, newTab: false, nofollow: false })})`}
                          aria-label="Edit detail link"
                          className="inline-flex size-7 shrink-0 items-center justify-center rounded border border-[#15130f]/15 bg-white text-[#15130f] opacity-80 transition-opacity hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                        >
                          <Link2 className="size-3.5" />
                        </button>
                      }
                    />
                  </div>
                ) : (
                  <div className="mt-1 block max-w-xl">
                    <InlineText
                      as="p"
                      multiline
                      value={item.value}
                      onChange={(v) => updateDetail(index, { value: v })}
                      className="block w-full whitespace-pre-wrap text-[15px] text-[#57524a]"
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeDetail(index)}
                aria-label="Remove detail"
                title="Remove detail"
                className="absolute top-0 right-0 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#15130f]/90 text-white opacity-0 transition-opacity group-hover/detail:opacity-100 hover:bg-[#15130f] focus-visible:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {data.contactDetails.length < 12 ? (
        <AddContactDetailMenu
          disabled={data.contactDetails.length >= 12}
          onAdd={addDetail}
        />
      ) : null}
    </div>
  ) : undefined;

  const nextStepsOverride = isPage ? (
    <div className={cn(appPanel, "mt-10 p-6")}>
      <InlineText
        value={data.nextStepsTitle}
        onChange={(v) => update({ nextStepsTitle: v })}
        className="text-sc-accent text-[11px] font-bold tracking-[0.2em] uppercase"
      />
      {data.nextSteps.length > 0 ? (
        <ol className="mt-4 space-y-3 text-[14px] leading-relaxed text-[#57524a]">
          {data.nextSteps.map((step, index) => (
            <li key={`step-${index}`} className="group/step relative pr-8">
              <InlineText
                multiline
                value={step}
                onChange={(v) => updateStep(index, v)}
                className="block"
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                aria-label="Remove step"
                title="Remove step"
                className="absolute top-0 right-0 inline-flex size-6 items-center justify-center rounded-full bg-[#15130f]/90 text-white opacity-0 transition-opacity group-hover/step:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ol>
      ) : null}
      {data.nextSteps.length < 12 ? (
        <button
          type="button"
          onClick={addStep}
          className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase transition-colors hover:text-[#15130f]"
        >
          <Plus className="size-3.5" /> Add step
        </button>
      ) : null}
    </div>
  ) : undefined;

  const faqFootnoteOverride = isPage ? (
    <p className="mt-6 text-[13px] text-[#6f6a60]">
      <InlineText
        value={data.faqLeadIn}
        onChange={(v) => update({ faqLeadIn: v })}
        className="inline"
      />{" "}
      <span className="inline-flex items-center gap-1">
        <InlineText
          value={data.faqLabel}
          onChange={(v) => update({ faqLabel: v })}
          className="hover:text-sc-accent underline underline-offset-4"
        />
        <LinkUrlPopover
          value={{
            href: data.faqHref,
            newTab: data.faqNewTab,
            nofollow: false,
          }}
          onPrepare={() => ({
            href: data.faqHref,
            newTab: data.faqNewTab,
            nofollow: false,
          })}
          onSave={(value: LinkFieldValue) =>
            update({ faqHref: value.href, faqNewTab: value.newTab })
          }
          trigger={
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded border bg-white"
              aria-label="Edit FAQ link"
            >
              <Link2 className="size-3.5" />
            </button>
          }
        />
      </span>
      .
    </p>
  ) : undefined;

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="contact"
    >
      <BlockDecoratorToolbar label="Contact" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Contact"
          description="Homepage band or full contact page layout. Edit copy on the canvas."
        >
          <SectionOptionSelect
            label="Layout"
            value={data.layout}
            onChange={(value) =>
              update({
                layout: value === "page" ? "page" : "band",
              })
            }
            options={[
              { value: "band", label: "Homepage band" },
              { value: "page", label: "Contact page" },
            ]}
          />
          <SectionOptionCheckbox
            label="Show contact form"
            checked={data.showForm}
            onChange={(checked) => update({ showForm: checked })}
          />
          {isPage ? (
            <>
              <SectionOptionCheckbox
                label="Show contact details list"
                checked={data.showContactDetails}
                onChange={(checked) => update({ showContactDetails: checked })}
              />
              <SectionOptionCheckbox
                label='Show "What happens next" panel'
                checked={data.showNextSteps}
                onChange={(checked) => update({ showNextSteps: checked })}
              />
            </>
          ) : null}
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <ContactSection
        data={data}
        introOverride={introFields}
        detailsOverride={detailsOverride}
        nextStepsOverride={nextStepsOverride}
        faqFootnoteOverride={faqFootnoteOverride}
      />
    </div>
  );
}
