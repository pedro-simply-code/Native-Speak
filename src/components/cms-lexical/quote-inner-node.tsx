import {
  $applyNodeReplacement,
  ElementNode,
  type EditorConfig,
  type LexicalNode,
  type SerializedElementNode,
  type Spread,
} from "lexical";
import { appQuoteInner } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export const QUOTE_INNER_TYPE = "quote-inner";

export type SerializedQuoteInnerNode = Spread<
  { type: typeof QUOTE_INNER_TYPE },
  SerializedElementNode
>;

export class QuoteInnerNode extends ElementNode {
  static getType(): typeof QUOTE_INNER_TYPE {
    return QUOTE_INNER_TYPE;
  }

  static clone(node: QuoteInnerNode): QuoteInnerNode {
    return new QuoteInnerNode(node.__key);
  }

  // Lexical passes editor theme; classes are fixed via appQuoteInner.
  createDOM(_config: EditorConfig): HTMLElement {
    void _config;
    const span = document.createElement("span");
    span.className = cn(appQuoteInner, "block");
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedQuoteInnerNode): QuoteInnerNode {
    return $createQuoteInnerNode().updateFromJSON(serializedNode);
  }

  exportJSON(): SerializedQuoteInnerNode {
    return {
      ...super.exportJSON(),
      type: QUOTE_INNER_TYPE,
    };
  }

  canBeEmpty(): boolean {
    return false;
  }
}

export function $createQuoteInnerNode(): QuoteInnerNode {
  return $applyNodeReplacement(new QuoteInnerNode());
}

export function $isQuoteInnerNode(
  node: LexicalNode | null | undefined,
): node is QuoteInnerNode {
  return node instanceof QuoteInnerNode;
}
