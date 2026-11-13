import {
  $applyNodeReplacement,
  ElementNode,
  type EditorConfig,
  type LexicalNode,
  type SerializedElementNode,
  type Spread,
} from "lexical";
import { appQuotePageWrap } from "@/lib/cms/surface";

export const QUOTE_WRAP_NODE_TYPE = "quote-wrap";

export type SerializedQuoteWrapNode = Spread<
  { type: typeof QUOTE_WRAP_NODE_TYPE },
  SerializedElementNode
>;

/** Root-level shell div around a Lexical `quote` blockquote (editor + saved JSON). */
export class QuoteWrapNode extends ElementNode {
  static getType(): typeof QUOTE_WRAP_NODE_TYPE {
    return QUOTE_WRAP_NODE_TYPE;
  }

  static clone(node: QuoteWrapNode): QuoteWrapNode {
    return new QuoteWrapNode(node.__key);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    void _config;
    const div = document.createElement("div");
    div.className = appQuotePageWrap;
    div.dataset.editorBlock = "quote-wrap";
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedQuoteWrapNode): QuoteWrapNode {
    return $createQuoteWrapNode().updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedQuoteWrapNode {
    return {
      ...super.exportJSON(),
      type: QUOTE_WRAP_NODE_TYPE,
    };
  }

  canBeEmpty(): boolean {
    return false;
  }

  isInline(): boolean {
    return false;
  }
}

export function $createQuoteWrapNode(): QuoteWrapNode {
  return $applyNodeReplacement(new QuoteWrapNode());
}

export function $isQuoteWrapNode(
  node: LexicalNode | null | undefined,
): node is QuoteWrapNode {
  return node instanceof QuoteWrapNode;
}
