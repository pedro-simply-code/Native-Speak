"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $finalizeDecoratorDocument } from "@/components/cms-lexical/insert-decorator-block";

const HOIST_TAG = "block-decorator-hoist";

/**
 * Lexical sometimes nests block decorators inside `<p>` (invalid HTML). Reconcile
 * after load and edits without `registerNodeTransform` (avoids infinite loops).
 */
export function BlockDecoratorRootPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => $finalizeDecoratorDocument(), { tag: HOIST_TAG });

    return editor.registerUpdateListener(({ tags }) => {
      if (tags.has(HOIST_TAG)) return;
      editor.update(() => $finalizeDecoratorDocument(), { tag: HOIST_TAG });
    });
  }, [editor]);

  return null;
}
