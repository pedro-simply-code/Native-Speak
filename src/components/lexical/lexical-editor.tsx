"use client";

import { useMemo } from "react";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import type { EditorState, SerializedEditorState } from "lexical";
import { LexicalToolbar } from "@/components/lexical/lexical-toolbar";
import { lexicalTheme } from "@/components/lexical/lexical-theme";

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  return <LexicalToolbar editor={editor} />;
}

export type LexicalEditorProps = {
  namespace?: string;
  initialState?: SerializedEditorState | Record<string, unknown> | null;
  placeholder?: string;
  minHeightClassName?: string;
  onChange?: (state: SerializedEditorState) => void;
  onMarkdownChange?: (markdown: string) => void;
};

export function LexicalEditor({
  namespace = "NativeSpeakEditor",
  initialState,
  placeholder = "Start writing…",
  minHeightClassName = "min-h-[220px]",
  onChange,
  onMarkdownChange,
}: LexicalEditorProps) {
  const initialConfig = useMemo(
    () => ({
      namespace,
      theme: lexicalTheme,
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
        LinkNode,
        TableNode,
        TableCellNode,
        TableRowNode,
      ],
      onError(error: Error) {
        console.error(error);
      },
      editorState: initialState
        ? JSON.stringify(initialState)
        : undefined,
    }),
    [namespace, initialState],
  );

  function handleChange(editorState: EditorState) {
    editorState.read(() => {
      if (onChange) {
        onChange(editorState.toJSON() as SerializedEditorState);
      }
      if (onMarkdownChange) {
        onMarkdownChange($convertToMarkdownString(TRANSFORMERS));
      }
    });
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="lexical-editor relative overflow-hidden rounded-lg border border-[var(--dash-border)] bg-white">
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={`lexical-input ${minHeightClassName} px-4 py-3 outline-none`}
              aria-placeholder={placeholder}
              placeholder={
                <span className="lexical-placeholder pointer-events-none absolute px-4 py-3 text-sm text-[var(--dash-muted)]">
                  {placeholder}
                </span>
              }
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <TablePlugin hasCellMerge hasCellBackgroundColor hasTabHandler />
        <TabIndentationPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        {onChange || onMarkdownChange ? (
          <OnChangePlugin ignoreSelectionChange onChange={handleChange} />
        ) : null}
      </div>
    </LexicalComposer>
  );
}
