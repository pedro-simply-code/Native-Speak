"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { ArrowRight, Check, Link2, Pencil, Plus, X } from "lucide-react";
import { createElement, useState, type ReactElement } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SERVICE_ICON_OPTIONS,
  serviceOfferingIcon,
} from "@/components/cms-content/service-offerings-section";
import {
  DEFAULT_SERVICE_OFFERINGS_SECTION,
  normalizeServiceOfferingsSectionData,
  SERVICE_OFFERINGS_SECTION_NODE_TYPE,
  type ServiceOffering,
  type ServiceOfferingTool,
  type ServiceOfferingsSectionData,
} from "@/lib/cms/site-page-sections";
import { appGhostButton, appPanel } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export type SerializedServiceOfferingsSectionNode = Spread<
  { data: ServiceOfferingsSectionData },
  SerializedLexicalNode
>;

export class ServiceOfferingsSectionNode extends DecoratorNode<ReactElement> {
  __data: ServiceOfferingsSectionData;

  static getType(): string {
    return SERVICE_OFFERINGS_SECTION_NODE_TYPE;
  }

  static clone(node: ServiceOfferingsSectionNode): ServiceOfferingsSectionNode {
    return new ServiceOfferingsSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedServiceOfferingsSectionNode,
  ): ServiceOfferingsSectionNode {
    return $createServiceOfferingsSectionNode(
      normalizeServiceOfferingsSectionData(serializedNode.data),
    );
  }

  constructor(data?: ServiceOfferingsSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeServiceOfferingsSectionData(data);
  }

  exportJSON(): SerializedServiceOfferingsSectionNode {
    return {
      ...super.exportJSON(),
      type: SERVICE_OFFERINGS_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-service-offerings-node";
    div.dataset.editorBlock = "service-offerings";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): ServiceOfferingsSectionData {
    return this.getLatest().__data;
  }

  setData(data: ServiceOfferingsSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return (
      <ServiceOfferingsSectionEditor
        nodeKey={this.getKey()}
        data={this.__data}
      />
    );
  }
}

export function $createServiceOfferingsSectionNode(
  data: ServiceOfferingsSectionData = DEFAULT_SERVICE_OFFERINGS_SECTION,
): ServiceOfferingsSectionNode {
  return $applyNodeReplacement(new ServiceOfferingsSectionNode(data));
}

export function $isServiceOfferingsSectionNode(
  node: LexicalNode | null | undefined,
): node is ServiceOfferingsSectionNode {
  return node instanceof ServiceOfferingsSectionNode;
}

function ServiceIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Change icon"
          aria-label="Change icon"
          className="text-sc-accent-bright group/icon relative flex size-12 items-center justify-center bg-[#15130f] transition-shadow hover:ring-2 hover:ring-[#15130f]/30"
        >
          {createElement(serviceOfferingIcon(value), { className: "size-5" })}
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
          {SERVICE_ICON_OPTIONS.map((option) => {
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
                  "flex size-9 items-center justify-center rounded transition-colors",
                  active
                    ? "bg-[#15130f] text-white hover:bg-[#15130f]"
                    : "text-[#57524a] hover:bg-[#15130f]/5",
                )}
              >
                {createElement(option.icon, { className: "size-4" })}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ServiceOfferingsSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: ServiceOfferingsSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isServiceOfferingsSectionNode,
  );
  const { service } = data;

  const updateService = (patch: Partial<ServiceOffering>) =>
    update({ service: { ...service, ...patch } });

  const updateDeliverable = (itemIndex: number, value: string) => {
    updateService({
      deliverables: service.deliverables.map((item, index) =>
        index === itemIndex ? value : item,
      ),
    });
  };

  const addDeliverable = () => {
    updateService({ deliverables: [...service.deliverables, ""] });
  };

  const removeDeliverable = (itemIndex: number) => {
    updateService({
      deliverables: service.deliverables.filter(
        (_, index) => index !== itemIndex,
      ),
    });
  };

  const updateTool = (
    toolIndex: number,
    patch: Partial<ServiceOfferingTool>,
  ) => {
    updateService({
      tools: service.tools.map((tool, index) =>
        index === toolIndex ? { ...tool, ...patch } : tool,
      ),
    });
  };

  const addTool = () => {
    updateService({ tools: [...service.tools, { label: "", href: "" }] });
  };

  const removeTool = (toolIndex: number) => {
    updateService({
      tools: service.tools.filter((_, index) => index !== toolIndex),
    });
  };

  const anchor = service.slug.trim() || "service";

  return (
    <div
      contentEditable={false}
      className="group/block text-sc-ink relative"
      data-editor-block="service-offerings"
    >
      <BlockDecoratorToolbar label="Service offering" onRemove={remove} />

      <section
        id={anchor}
        className="scroll-mt-24 border-b border-[#15130f]/10 bg-white py-16 lg:py-24"
      >
        <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <div className="flex items-center gap-4">
              <ServiceIconPicker
                value={service.icon}
                onChange={(icon) => updateService({ icon })}
              />
              <span className="text-[11px] font-bold tracking-[0.22em] text-[#6f6a60] uppercase">
                <InlineText
                  value={service.number}
                  onChange={(number) => updateService({ number })}
                  placeholder="01"
                />{" "}
                /{" "}
                <InlineText
                  value={service.label}
                  onChange={(label) => updateService({ label })}
                  placeholder="Service"
                />
              </span>
            </div>

            <InlineText
              as="h2"
              value={service.title}
              onChange={(title) => updateService({ title })}
              placeholder="Service title"
              className="mt-6 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase"
            />
            <InlineText
              as="p"
              multiline
              value={service.description}
              onChange={(description) => updateService({ description })}
              placeholder="Describe this service…"
              className="mt-5 text-[16px] leading-relaxed whitespace-pre-wrap text-[#57524a]"
            />

            {service.tools.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {service.tools.map((tool, toolIndex) => (
                  <span
                    key={toolIndex}
                    className="group/tool relative inline-flex"
                  >
                    <span className={cn(appGhostButton, "cursor-text")}>
                      <InlineText
                        value={tool.label}
                        onChange={(label) => updateTool(toolIndex, { label })}
                        placeholder="Tool"
                      />
                    </span>
                    <LinkUrlPopover
                      value={{
                        href: tool.href,
                        newTab: false,
                        nofollow: false,
                      }}
                      onPrepare={() => ({
                        href: tool.href,
                        newTab: false,
                        nofollow: false,
                      })}
                      onSave={(value) =>
                        updateTool(toolIndex, { href: value.href })
                      }
                      title="Tool link"
                      hint="Optional. Leave empty for a plain chip."
                      placeholder="/path or https://…"
                      trigger={
                        <button
                          type="button"
                          title={`Edit link (${linkFieldSummary({ href: tool.href, newTab: false, nofollow: false })})`}
                          aria-label="Edit tool link"
                          className="absolute -top-2 -right-2 inline-flex size-5 items-center justify-center rounded-full bg-[#15130f] text-white opacity-0 shadow-md transition-opacity group-hover/tool:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                        >
                          <Link2 className="size-3" />
                        </button>
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeTool(toolIndex)}
                      aria-label="Remove tool"
                      title="Remove tool"
                      className="absolute -top-2 -left-2 inline-flex size-5 items-center justify-center rounded-full bg-[#15130f]/90 text-white/80 opacity-0 shadow-sm transition-opacity group-hover/tool:opacity-100 hover:bg-[#15130f] hover:text-white focus-visible:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-5">
              <button
                type="button"
                onClick={addTool}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase transition-colors hover:text-[#15130f]"
              >
                <Plus className="size-3.5" /> Add tool
              </button>
            </div>
          </div>

          <div className={cn(appPanel, "p-8")}>
            <InlineText
              as="p"
              value={service.deliverablesTitle}
              onChange={(deliverablesTitle) =>
                updateService({ deliverablesTitle })
              }
              placeholder="What you get"
              className="text-sc-accent text-[11px] font-bold tracking-[0.2em] uppercase"
            />
            <ul className="mt-5 space-y-3.5">
              {service.deliverables.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="group/deliverable relative flex items-start gap-3"
                >
                  <Check className="text-sc-accent mt-0.5 size-4 shrink-0" />
                  <InlineText
                    as="span"
                    value={item}
                    onChange={(value) => updateDeliverable(itemIndex, value)}
                    placeholder="Deliverable"
                    className="text-[15px] leading-relaxed text-[#57524a]"
                  />
                  <button
                    type="button"
                    onClick={() => removeDeliverable(itemIndex)}
                    aria-label="Remove deliverable"
                    title="Remove deliverable"
                    className="absolute top-0 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-[#15130f]/90 text-white/80 opacity-0 shadow-sm transition-opacity group-hover/deliverable:opacity-100 hover:bg-[#15130f] hover:text-white focus-visible:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <button
                type="button"
                onClick={addDeliverable}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase transition-colors hover:text-[#15130f]"
              >
                <Plus className="size-3.5" /> Add deliverable
              </button>
            </div>

            <div className="mt-8">
              <span className="group/action relative inline-flex">
                <span className="inline-flex items-center gap-2 rounded-md bg-[#15130f] px-6 py-3 text-[11px] font-bold tracking-[0.16em] text-white uppercase">
                  <InlineText
                    value={service.buttonLabel}
                    onChange={(buttonLabel) => updateService({ buttonLabel })}
                    placeholder="Discuss this service"
                  />
                  <ArrowRight className="size-4" />
                </span>
                <LinkUrlPopover
                  value={{
                    href: service.buttonHref,
                    newTab: service.buttonNewTab,
                    nofollow: service.buttonNofollow,
                  }}
                  onPrepare={() => ({
                    href: service.buttonHref,
                    newTab: service.buttonNewTab,
                    nofollow: service.buttonNofollow,
                  })}
                  onSave={(value) =>
                    updateService({
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
                        href: service.buttonHref,
                        newTab: service.buttonNewTab,
                        nofollow: service.buttonNofollow,
                      })})`}
                      aria-label="Edit button link"
                      className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full bg-[#15130f] text-white opacity-0 shadow-md ring-1 ring-white/40 transition-opacity group-hover/action:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
                    >
                      <Link2 className="size-3" />
                    </button>
                  }
                />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
