"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { QuoteNode } from "@lexical/rich-text";
import { $isParagraphNode } from "lexical";
import { useEffect } from "react";
import { $isQuoteInnerNode } from "@/components/cms-lexical/quote-inner-node";
import {
  $createQuoteWrapNode,
  $isQuoteWrapNode,
  QUOTE_WRAP_NODE_TYPE,
} from "@/components/cms-lexical/quote-wrap-node";

/** Legacy inner span + root-level div shell around each quote blockquote. */
export function QuoteWrapPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(QuoteNode, (quote) => {
      const first = quote.getFirstChild();
      if ($isQuoteInnerNode(first) && first.getNextSibling() === null) {
        const toMove = [...first.getChildren()];
        for (const child of toMove) {
          quote.append(child);
        }
        first.remove();
      }

      const parent = quote.getParent();
      if (parent !== null && $isQuoteWrapNode(parent)) return;

      if (parent !== null && $isParagraphNode(parent)) {
        return;
      }

      if (parent === null || parent.getType() !== "root") return;

      const wrap = $createQuoteWrapNode();
      quote.insertBefore(wrap);
      wrap.append(quote);
    });
  }, [editor]);

  return null;
}
export { QUOTE_WRAP_NODE_TYPE };