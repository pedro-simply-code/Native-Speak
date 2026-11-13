"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { LinkNode, TOGGLE_LINK_COMMAND, $isLinkNode } from "@lexical/link";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getNearestNodeOfType } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  type EditorState,
  type InitialEditorStateType,
  type TextFormatType,
} from "lexical";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bold,
  Code,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { HeroNode } from "@/components/cms-lexical/hero-node";
import { CtaSectionNode } from "@/components/cms-lexical/cta-node";
import { PageHeaderSectionNode } from "@/components/cms-lexical/page-header-node";
import { PageIntroSectionNode } from "@/components/cms-lexical/page-intro-node";
import { FeatureGridSectionNode } from "@/components/cms-lexical/feature-grid-node";
import { StepsSectionNode } from "@/components/cms-lexical/steps-node";
import { BlogSectionNode } from "@/components/cms-lexical/blog-node";
import { MARKETING_SECTION_NODE_CLASSES } from "@/components/cms-lexical/marketing-block-nodes";
import { ContentEditorPostsProvider } from "@/components/cms-lexical/content-editor-posts-context";
import { ContentBlockInserter } from "@/components/cms-lexical/content-block-inserter";
import { ContentDraggableBlockPlugin } from "@/components/cms-lexical/content-draggable-block-plugin";
import { ContentEditorProjectsProvider } from "@/components/cms-lexical/content-editor-projects-context";
import { BlockDecoratorRootPlugin } from "@/components/cms-lexical/block-decorator-root-plugin";
import { LinkUrlPopover } from "@/components/cms-lexical/link-url-popover";
import { QuoteWrapPlugin } from "@/components/cms-lexical/quote-wrap-plugin";
import { QuoteWrapNode } from "@/components/cms-lexical/quote-wrap-node";
import { QuoteInnerNode } from "@/components/cms-lexical/quote-inner-node";
import {
  buildLinkRel,
  EMPTY_LINK_FIELD,
  linkRelHasNofollow,
  type LinkFieldValue,
} from "@/lib/cms/link-options";
import {
  emptyContentDocument,
  parseContentDocument,
  type ContentDocument,
} from "@/lib/cms/content";
import type { Project } from "@/cms-seed-content/projects";
import type { PublicContentSummary } from "@/server/content/queries";
import { appQuoteInner, appQuoteOuter } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

/** Typography only — horizontal inset for prose blocks lives in `globals.css` (`.content-editor-body`). */
const EDITOR_THEME = {
  paragraph:
    "mb-4 text-[16px] leading-[1.8] text-[#3f3b34] whitespace-pre-wrap",
  heading: {
    h1: "mt-10 mb-4 text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.05] font-black uppercase tracking-[-0.03em]",
    h2: "mt-10 mb-4 text-[clamp(1.6rem,3vw,2.3rem)] leading-[1.08] font-black uppercase tracking-[-0.03em]",
    h3: "mt-8 mb-3 text-[1.35rem] leading-tight font-black tracking-[-0.02em]",
  },
  quote: cn(appQuoteOuter, appQuoteInner, "not-italic font-normal"),
  list: {
    ul: "mb-4 list-disc pl-6",
    ol: "mb-4 list-decimal pl-6",
    listitem: "mb-1.5 text-[16px] leading-[1.7] text-[#3f3b34]",
  },
  link: "text-sc-accent underline underline-offset-2",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "rounded bg-[#15130f]/5 px-1 py-0.5 font-mono text-[0.9em]",
    highlight: "bg-yellow-200/70 px-0.5",
  },
};

type BlockType = "paragraph" | "h1" | "h2" | "h3" | "quote";

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded transition-colors",
        active
          ? "bg-sc-accent text-white"
          : "hover:bg-sc-accent/10 hover:text-sc-accent text-[#57524a]",
      )}
    >
      {children}
    </button>
  );
}

function readLinkFromEditor(
  editor: ReturnType<typeof useLexicalComposerContext>[0],
): LinkFieldValue {
  let href = "";
  let newTab = false;
  let nofollow = false;
  editor.getEditorState().read(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;
    const node = selection.anchor.getNode();
    const linkNode = $isLinkNode(node)
      ? node
      : $isLinkNode(node.getParent())
        ? node.getParent()
        : null;
    if (!linkNode || !$isLinkNode(linkNode)) return;
    href = linkNode.getURL();
    newTab = linkNode.getTarget() === "_blank";
    nofollow = linkRelHasNofollow(linkNode.getRel());
  });
  return { href, newTab, nofollow };
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [block, setBlock] = useState<BlockType>("paragraph");
  const [formats, setFormats] = useState<Record<string, boolean>>({});

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const anchor = selection.anchor.getNode();
        const heading = $getNearestNodeOfType(anchor, HeadingNode);
        const quoteNode = $getNearestNodeOfType(anchor, QuoteNode);

        if (heading) {
          const tag = heading.getTag();
          setBlock(
            tag === "h1"
              ? "h1"
              : tag === "h3"
                ? "h3"
                : tag === "h2"
                  ? "h2"
                  : "h2",
          );
        } else if (quoteNode) {
          setBlock("quote");
        } else {
          setBlock("paragraph");
        }

        setFormats({
          bold: selection.hasFormat("bold"),
          italic: selection.hasFormat("italic"),
          underline: selection.hasFormat("underline"),
          strikethrough: selection.hasFormat("strikethrough"),
          code: selection.hasFormat("code"),
        });
      });
    });
  }, [editor]);

  const toggleFormat = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const applyBlock = (value: BlockType) => {
    editor.update(
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;
        if (value === "quote") {
          $setBlocksType(selection, () => $createQuoteNode());
        } else if (value === "paragraph") {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(value));
        }
      },
      { onUpdate: () => editor.focus() },
    );
    setBlock(value);
  };

  const applyLink = (value: LinkFieldValue) => {
    const url = value.href.trim();
    if (!url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
      url,
      target: value.newTab ? "_blank" : null,
      rel: buildLinkRel({
        newTab: value.newTab,
        nofollow: value.nofollow,
      }),
    });
  };

  return (
    <div className="border-sc-accent/25 bg-sc-section-alt/95 sticky top-[8.75rem] z-[9] flex flex-wrap items-center gap-1.5 border-b px-5 py-2 backdrop-blur-sm">
      <select
        aria-label="Block type"
        value={block}
        onChange={(event) => applyBlock(event.target.value as BlockType)}
        className="focus:ring-sc-accent/40 mr-1 h-8 rounded border border-[#15130f]/15 bg-white px-2 text-[11px] font-semibold tracking-[0.06em] uppercase focus:ring-2 focus:outline-none"
      >
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
        <option value="quote">Quote</option>
      </select>

      <ToolbarButton
        label="Bold"
        active={formats.bold}
        onClick={() => toggleFormat("bold")}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={formats.italic}
        onClick={() => toggleFormat("italic")}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={formats.underline}
        onClick={() => toggleFormat("underline")}
      >
        <Underline className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={formats.strikethrough}
        onClick={() => toggleFormat("strikethrough")}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={formats.code}
        onClick={() => toggleFormat("code")}
      >
        <Code className="size-4" />
      </ToolbarButton>

      <span className="bg-sc-accent/20 mx-1 h-5 w-px" aria-hidden />

      <ToolbarButton
        label="Bulleted list"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="Quote" onClick={() => applyBlock("quote")}>
        <Quote className="size-4" />
      </ToolbarButton>
      <LinkUrlPopover
        value={EMPTY_LINK_FIELD}
        onPrepare={() => readLinkFromEditor(editor)}
        onSave={applyLink}
        align="center"
        side="bottom"
        trigger={
          <ToolbarButton label="Link">
            <Link2 className="size-4" />
          </ToolbarButton>
        }
      />

      <span className="bg-sc-accent/20 mx-1 h-5 w-px" aria-hidden />

      <ToolbarButton
        label="Undo"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <Redo2 className="size-4" />
      </ToolbarButton>

      <ContentBlockInserter />
    </div>
  );
}

function Placeholder() {
  return (
    <p className="pointer-events-none absolute top-4 left-[1.25rem] text-[15px] leading-[1.8] text-[#a8a29a]">
      Start writing your content…
    </p>
  );
}

export function ContentEditor({
  initialDocument,
  namespace = "simplycode-content",
  previewProjects = [],
  previewPosts = [],
}: {
  initialDocument?: ContentDocument | null;
  namespace?: string;
  /** Published projects from studio (work / portfolio blocks in the canvas). */
  previewProjects?: Project[];
  /** Published posts for the blog section block in the canvas. */
  previewPosts?: PublicContentSummary[];
}) {
  const [document] = useState<ContentDocument>(
    () => parseContentDocument(initialDocument) ?? emptyContentDocument(),
  );
  const [serialized, setSerialized] = useState(() => JSON.stringify(document));

  const initialConfig = useMemo(
    () => ({
      namespace,
      nodes: [
        HeadingNode,
        QuoteNode,
        QuoteWrapNode,
        ListNode,
        ListItemNode,
        LinkNode,
        HeroNode,
        CtaSectionNode,
        PageHeaderSectionNode,
        PageIntroSectionNode,
        FeatureGridSectionNode,
        StepsSectionNode,
        BlogSectionNode,
        ...MARKETING_SECTION_NODE_CLASSES,
        QuoteInnerNode,
      ],
      theme: EDITOR_THEME,
      onError(error: Error) {
        console.error("[content-editor]", error);
      },
      editorState: JSON.stringify(document) as InitialEditorStateType,
    }),
    [document, namespace],
  );

  const handleChange = (editorState: EditorState) => {
    setSerialized(JSON.stringify(editorState.toJSON()));
  };

  const editorBodyRef = useRef<HTMLDivElement>(null);
  const [editorAnchor, setEditorAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setEditorAnchor(editorBodyRef.current);
  }, []);

  return (
    <div className="min-w-0">
      <input type="hidden" name="body" value={serialized} readOnly />
      <ContentEditorProjectsProvider projects={previewProjects}>
        <ContentEditorPostsProvider posts={previewPosts}>
          <LexicalComposer initialConfig={initialConfig}>
          <Toolbar />
          <div ref={editorBodyRef} className="content-editor-body relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  aria-label="Content"
                  className="min-h-[360px] outline-none"
                />
              }
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <ContentDraggableBlockPlugin anchorElem={editorAnchor} />
            <HistoryPlugin />
            <ListPlugin />
            <LinkPlugin />
            <QuoteWrapPlugin />
            <BlockDecoratorRootPlugin />
            <OnChangePlugin onChange={handleChange} />
          </div>
        </LexicalComposer>
        </ContentEditorPostsProvider>
      </ContentEditorProjectsProvider>
    </div>
  );
}
