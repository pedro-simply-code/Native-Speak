"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { Plus, Settings2, X } from "lucide-react";
import { type ReactElement } from "react";
import { LegalDocumentSection } from "@/components/cms-content/legal-document-section";
import type { LegalSectionBlock } from "@/cms-seed-content/legal-defaults";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  DEFAULT_TERMS_DOCUMENT_SECTION,
  LEGAL_DOCUMENT_SECTION_NODE_TYPE,
  normalizeLegalDocumentSectionData,
  type LegalDocumentSectionData,
} from "@/lib/cms/site-page-sections";

export type SerializedLegalDocumentSectionNode = Spread<
  { data: LegalDocumentSectionData },
  SerializedLexicalNode
>;

export class LegalDocumentSectionNode extends DecoratorNode<ReactElement> {
  __data: LegalDocumentSectionData;

  static getType(): string {
    return LEGAL_DOCUMENT_SECTION_NODE_TYPE;
  }

  static clone(node: LegalDocumentSectionNode): LegalDocumentSectionNode {
    return new LegalDocumentSectionNode(node.__data, node.__key);
  }

  static importJSON(
    serializedNode: SerializedLegalDocumentSectionNode,
  ): LegalDocumentSectionNode {
    return $createLegalDocumentSectionNode(
      normalizeLegalDocumentSectionData(serializedNode.data),
    );
  }

  constructor(data?: LegalDocumentSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeLegalDocumentSectionData(data);
  }

  exportJSON(): SerializedLegalDocumentSectionNode {
    return {
      ...super.exportJSON(),
      type: LEGAL_DOCUMENT_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-legal-document-node";
    div.dataset.editorBlock = "legal-document";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): LegalDocumentSectionData {
    return this.getLatest().__data;
  }

  setData(data: LegalDocumentSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return (
      <LegalDocumentSectionEditor nodeKey={this.getKey()} data={this.__data} />
    );
  }
}

export function $createLegalDocumentSectionNode(
  data: LegalDocumentSectionData = DEFAULT_TERMS_DOCUMENT_SECTION,
): LegalDocumentSectionNode {
  return $applyNodeReplacement(new LegalDocumentSectionNode(data));
}

export function $isLegalDocumentSectionNode(
  node: LexicalNode | null | undefined,
): node is LegalDocumentSectionNode {
  return node instanceof LegalDocumentSectionNode;
}

function LegalDocumentSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: LegalDocumentSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(
    nodeKey,
    $isLegalDocumentSectionNode,
  );

  const patchSections = (sections: LegalSectionBlock[]) => {
    update({ sections: sections.slice(0, 24) });
  };

  const updateSection = (index: number, patch: Partial<LegalSectionBlock>) => {
    patchSections(
      data.sections.map((section, i) =>
        i === index ? { ...section, ...patch } : section,
      ),
    );
  };

  const removeSection = (index: number) => {
    patchSections(data.sections.filter((_, i) => i !== index));
  };

  const addSection = () => {
    if (data.sections.length >= 24) return;
    patchSections([
      ...data.sections,
      {
        title: `${data.sections.length + 1}. Section title`,
        body: "Section body text.",
      },
    ]);
  };

  const bodyOverride = (
    <>
      <InlineText
        as="p"
        value={data.eyebrow}
        onChange={(v) => update({ eyebrow: v })}
        className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
      />
      <InlineText
        as="h1"
        value={data.headline}
        onChange={(v) => update({ headline: v })}
        className="mt-5 text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] font-black tracking-[-0.04em] uppercase"
      />
      <p className="mt-4 text-[13px] tracking-[0.08em] text-[#6f6a60] uppercase">
        Last updated:{" "}
        <InlineText
          as="span"
          value={data.lastUpdated}
          onChange={(v) => update({ lastUpdated: v })}
          className="inline"
        />
      </p>
      <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-[#57524a]">
        {data.sections.map((section, index) => (
          <section
            key={`legal-${index}`}
            className="group/legal relative pr-8"
          >
            <InlineText
              as="h2"
              value={section.title}
              onChange={(v) => updateSection(index, { title: v })}
              className="block text-lg font-black tracking-tight text-[#15130f] uppercase"
            />
            <InlineText
              as="p"
              multiline
              value={section.body}
              onChange={(v) => updateSection(index, { body: v })}
              className="mt-3 block whitespace-pre-wrap"
            />
            <button
              type="button"
              onClick={() => removeSection(index)}
              aria-label="Remove section"
              className="absolute top-0 right-0 inline-flex size-7 items-center justify-center rounded-full bg-[#15130f]/90 text-white opacity-0 transition-opacity group-hover/legal:opacity-100 focus-visible:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </section>
        ))}
      </div>
      {data.sections.length < 24 ? (
        <button
          type="button"
          onClick={addSection}
          className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase transition-colors hover:text-[#15130f]"
        >
          <Plus className="size-3.5" /> Add section
        </button>
      ) : null}
    </>
  );

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="legal-document"
    >
      <BlockDecoratorToolbar label="Legal document" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Legal document"
          description="Terms, privacy or similar long-form legal pages."
        >
          <p className="text-[12px] text-[#57524a]">
            Use <strong>Add section</strong> at the bottom of the document.
          </p>
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <LegalDocumentSection data={data} bodyOverride={bodyOverride} />
    </div>
  );
}
