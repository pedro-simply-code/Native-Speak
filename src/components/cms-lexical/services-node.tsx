"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { Plus, Settings2 } from "lucide-react";
import { useState, type ReactElement } from "react";
import { ServicesSection } from "@/components/cms-content/services-section";
import { ServiceCardPreview } from "@/components/cms-lexical/services-card-preview";
import {
  BlockDecoratorToolbar,
  InlineText,
  ToolbarIconButton,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DEFAULT_SERVICES_SECTION,
  normalizeServicesSectionData,
  SERVICES_SECTION_NODE_TYPE,
  type ServicesSectionData,
} from "@/lib/cms/homepage-sections";
import {
  DEFAULT_CUSTOM_SERVICE_CARD,
  resolveServicesSectionCards,
} from "@/lib/cms/services-section-cards";
import { siteStagger } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export type SerializedServicesSectionNode = Spread<
  { data: ServicesSectionData },
  SerializedLexicalNode
>;

export class ServicesSectionNode extends DecoratorNode<ReactElement> {
  __data: ServicesSectionData;

  static getType(): string {
    return SERVICES_SECTION_NODE_TYPE;
  }

  static clone(node: ServicesSectionNode): ServicesSectionNode {
    return new ServicesSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedServicesSectionNode,
  ): ServicesSectionNode {
    return $createServicesSectionNode(
      normalizeServicesSectionData(serializedNode.data),
    );
  }

  constructor(data?: ServicesSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeServicesSectionData(data);
  }

  exportJSON(): SerializedServicesSectionNode {
    return {
      ...super.exportJSON(),
      type: SERVICES_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-services-node";
    div.dataset.editorBlock = "services";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): ServicesSectionData {
    return this.getLatest().__data;
  }

  setData(data: ServicesSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return (
      <ServicesSectionEditor nodeKey={this.getKey()} data={this.__data} />
    );
  }
}

export function $createServicesSectionNode(
  data: ServicesSectionData = DEFAULT_SERVICES_SECTION,
): ServicesSectionNode {
  return $applyNodeReplacement(new ServicesSectionNode(data));
}

export function $isServicesSectionNode(
  node: LexicalNode | null | undefined,
): node is ServicesSectionNode {
  return node instanceof ServicesSectionNode;
}

function ServicesOptionsDialog({
  data,
  onUpdate,
}: {
  data: ServicesSectionData;
  onUpdate: (patch: Partial<ServicesSectionData>) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ToolbarIconButton
        label="Section options"
        icon={Settings2}
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-0 bg-white p-6 text-[#15130f] shadow-[0_8px_32px_rgba(21,19,15,0.14)] sm:max-w-lg">
          <DialogHeader className="text-left">
            <DialogTitle className="text-base font-black tracking-tight text-[#15130f] uppercase">
              Services section
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-[#57524a]">
              Card source, columns, agency spotlight.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-1 text-sm text-[#57524a]">
            <fieldset className="space-y-2">
              <legend className="text-[10px] font-bold tracking-[0.14em] text-[#15130f] uppercase">
                Cards
              </legend>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={data.cardSource === "site"}
                  onChange={() => onUpdate({ cardSource: "site" })}
                />
                Site catalog (homepage)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={data.cardSource === "custom"}
                  onChange={() =>
                    onUpdate({
                      cardSource: "custom",
                      customCards:
                        data.customCards.length > 0
                          ? data.customCards
                          : [{ ...DEFAULT_CUSTOM_SERVICE_CARD }],
                    })
                  }
                />
                Custom cards
              </label>
            </fieldset>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold tracking-[0.14em] text-[#15130f] uppercase">
                Columns
              </span>
              <select
                value={data.columns}
                onChange={(event) =>
                  onUpdate({
                    columns: Number(event.target.value) === 2 ? 2 : 3,
                  })
                }
                className="h-9 rounded border border-[#15130f]/15 bg-white px-2 text-sm"
              >
                <option value={3}>3 columns</option>
                <option value={2}>2 columns</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.showAgencySpotlight}
                onChange={(event) =>
                  onUpdate({ showAgencySpotlight: event.target.checked })
                }
              />
              Show agency spotlight
            </label>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ServicesSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: ServicesSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isServicesSectionNode,
  );
  const cards =
    data.cardSource === "custom"
      ? data.customCards
      : resolveServicesSectionCards(data);
  const gridClass =
    data.columns === 2
      ? "grid gap-6 sm:grid-cols-2"
      : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

  const cardsSlot =
    data.cardSource === "custom" ? (
      <>
        {cards.length > 0 ? (
          <div className={cn(siteStagger, gridClass)}>
            {cards.map((card, index) => (
              <ServiceCardPreview
                key={`${card.title}-${index}`}
                card={card}
                editable
                onUpdate={(patch) => {
                  const customCards = data.customCards.map((c, i) =>
                    i === index ? { ...c, ...patch } : c,
                  );
                  update({ customCards });
                }}
                onRemove={
                  data.customCards.length > 1
                    ? () =>
                        update({
                          customCards: data.customCards.filter(
                            (_, i) => i !== index,
                          ),
                        })
                    : undefined
                }
              />
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() =>
            update({
              customCards: [
                ...data.customCards,
                { ...DEFAULT_CUSTOM_SERVICE_CARD },
              ],
            })
          }
          className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase hover:text-sc-accent"
        >
          <Plus className="size-3.5" /> Add card
        </button>
      </>
    ) : undefined;

  return (
    <div
      contentEditable={false}
      data-editor-block="services"
      className="group/block text-sc-ink relative"
    >
      <BlockDecoratorToolbar label="Services" onRemove={remove}>
        <ServicesOptionsDialog data={data} onUpdate={update} />
      </BlockDecoratorToolbar>
      <ServicesSection
        data={data}
        cardsSlot={cardsSlot}
        introOverride={
          <>
            <InlineText
              as="p"
              value={data.eyebrow}
              onChange={(value) => update({ eyebrow: value })}
              placeholder="Our Services"
              className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
            />
            <InlineText
              as="h2"
              value={data.headline}
              onChange={(value) => update({ headline: value })}
              placeholder="What We Do Best"
              className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase"
            />
            <InlineText
              as="p"
              multiline
              value={data.description}
              onChange={(value) => update({ description: value })}
              placeholder="Section introduction…"
              className="mt-6 text-[16px] leading-relaxed whitespace-pre-wrap text-[#57524a]"
            />
          </>
        }
      />
    </div>
  );
}
