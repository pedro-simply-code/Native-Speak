"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { Settings2 } from "lucide-react";
import { type ReactElement } from "react";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionSelect,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  DEFAULT_STEPS_SECTION,
  normalizeStepsSectionData,
  STEPS_SECTION_NODE_TYPE,
  type StepsSectionData,
  type StepsSectionStep,
} from "@/lib/cms/site-page-sections";
import {
  appSectionBand,
  appSectionContainer,
  siteReveal,
  siteStagger,
} from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export type SerializedStepsSectionNode = Spread<
  { data: StepsSectionData },
  SerializedLexicalNode
>;

export class StepsSectionNode extends DecoratorNode<ReactElement> {
  __data: StepsSectionData;

  static getType(): string {
    return STEPS_SECTION_NODE_TYPE;
  }

  static clone(node: StepsSectionNode): StepsSectionNode {
    return new StepsSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedStepsSectionNode,
  ): StepsSectionNode {
    return $createStepsSectionNode(
      normalizeStepsSectionData(serializedNode.data),
    );
  }

  constructor(data?: StepsSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeStepsSectionData(data);
  }

  exportJSON(): SerializedStepsSectionNode {
    return {
      ...super.exportJSON(),
      type: STEPS_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-steps-node";
    div.dataset.editorBlock = "steps";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): StepsSectionData {
    return this.getLatest().__data;
  }

  setData(data: StepsSectionData): this {
    const writable = this.getWritable();
    writable.__data = normalizeStepsSectionData(data);
    return writable;
  }

  decorate(): ReactElement {
    return <StepsSectionEditor nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createStepsSectionNode(
  data: StepsSectionData = DEFAULT_STEPS_SECTION,
): StepsSectionNode {
  return $applyNodeReplacement(new StepsSectionNode(data));
}

export function $isStepsSectionNode(
  node: LexicalNode | null | undefined,
): node is StepsSectionNode {
  return node instanceof StepsSectionNode;
}

function StepsSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: StepsSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(nodeKey, $isStepsSectionNode);

  const setStepCount = (count: number) => {
    const next = Math.min(4, Math.max(1, count));
    const steps = [...data.steps];
    while (steps.length < next) {
      steps.push({ title: "Step", body: "" });
    }
    update({ steps: steps.slice(0, next) });
  };

  const updateStep = (index: number, patch: Partial<StepsSectionStep>) => {
    update({
      steps: data.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, ...patch } : step,
      ),
    });
  };

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="steps"
    >
      <BlockDecoratorToolbar label="Process steps" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Process steps"
        >
          <SectionOptionSelect
            label="Steps shown"
            value={data.steps.length}
            onChange={(value) => setStepCount(Number(value) || 4)}
            options={[1, 2, 3, 4].map((count) => ({
              value: count,
              label: `${count} step${count === 1 ? "" : "s"}`,
            }))}
          />
          <SectionOptionSelect
            label="Background"
            value={data.surface}
            onChange={(value) =>
              update({ surface: value === "default" ? "default" : "alt" })
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
          <div className="mb-14 max-w-2xl">
            <InlineText
              as="p"
              value={data.eyebrow}
              onChange={(eyebrow) => update({ eyebrow })}
              placeholder="Process"
              className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
            />
            <InlineText
              as="h2"
              multiline
              value={data.headline}
              onChange={(headline) => update({ headline })}
              placeholder={"From First Call\nTo Production"}
              className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] whitespace-pre-line uppercase"
            />
          </div>

          <ol
            className={cn(
              siteStagger,
              "grid gap-6 md:grid-cols-2 lg:grid-cols-4",
            )}
          >
            {data.steps.map((step, index) => (
              <li
                key={index}
                className={cn(siteReveal, "border-t-2 border-[#15130f] pt-5")}
              >
                <span className="text-sc-accent text-[11px] font-bold tracking-[0.2em]">
                  0{index + 1}
                </span>
                <InlineText
                  as="h3"
                  value={step.title}
                  onChange={(title) => updateStep(index, { title })}
                  placeholder="Step title"
                  className="mt-2 text-base font-black tracking-tight uppercase"
                />
                <InlineText
                  as="p"
                  multiline
                  value={step.body}
                  onChange={(body) => updateStep(index, { body })}
                  placeholder="Describe this step…"
                  className="mt-2 text-[14px] leading-relaxed whitespace-pre-wrap text-[#57524a]"
                />
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
