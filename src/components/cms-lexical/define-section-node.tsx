"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { type ComponentType, type ReactElement } from "react";
import {
  BlockDecoratorToolbar,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";

export function defineSectionNode<T extends Record<string, unknown>>(config: {
  type: string;
  label: string;
  blockId: string;
  defaultData: T;
  normalize: (value: unknown) => T;
  Component: ComponentType<{ data: T }>;
}) {
  type Serialized = Spread<{ data: T }, SerializedLexicalNode>;

  class SectionNode extends DecoratorNode<ReactElement> {
    __data: T;

    static getType(): string {
      return config.type;
    }

    static clone(node: SectionNode): SectionNode {
      return new SectionNode(node.__data, node.__key);
    }

    static importJSON(serializedNode: Serialized): SectionNode {
      return create(config.normalize(serializedNode.data));
    }

    constructor(data?: T, key?: NodeKey) {
      super(key);
      this.__data = config.normalize(data ?? config.defaultData);
    }

    exportJSON(): Serialized {
      return {
        ...super.exportJSON(),
        type: config.type,
        version: 1,
        data: this.__data,
      };
    }

    createDOM(): HTMLElement {
      const div = document.createElement("div");
      div.className = `content-${config.blockId}-node`;
      div.dataset.editorBlock = config.blockId;
      return div;
    }

    updateDOM(): false {
      return false;
    }

    isInline(): boolean {
      return false;
    }

    getData(): T {
      return this.getLatest().__data;
    }

    setData(data: T): this {
      const writable = this.getWritable();
      writable.__data = config.normalize(data);
      return writable;
    }

    decorate(): ReactElement {
      return (
        <SectionNodeEditor
          nodeKey={this.getKey()}
          data={this.__data}
          label={config.label}
          blockId={config.blockId}
          Component={config.Component}
          isNode={isNode}
        />
      );
    }
  }

  function create(data: T = config.defaultData): SectionNode {
    return $applyNodeReplacement(new SectionNode(data));
  }

  function isNode(node: LexicalNode | null | undefined): node is SectionNode {
    return node instanceof SectionNode;
  }

  return { Node: SectionNode, create, isNode, type: config.type };
}

function SectionNodeEditor<T extends Record<string, unknown>>({
  nodeKey,
  data,
  label,
  blockId,
  Component,
  isNode,
}: {
  nodeKey: NodeKey;
  data: T;
  label: string;
  blockId: string;
  Component: ComponentType<{ data: T }>;
  isNode: (node: LexicalNode | null | undefined) => boolean;
}) {
  const { remove } = useSectionNodeUpdate(
    nodeKey,
    isNode as (node: LexicalNode | null | undefined) => node is LexicalNode & {
      setData: (data: T) => void;
      getData: () => T;
    },
  );

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block={blockId}
    >
      <BlockDecoratorToolbar label={label} onRemove={remove} />
      <Component data={data} />
    </div>
  );
}
