"use client";

import { useCallback, useEffect, useState } from "react";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  type LexicalEditor,
} from "lexical";
import { $findMatchingParent, $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import TextField from "@mui/material/TextField";

type BlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "quote"
  | "code"
  | "bullet"
  | "number";

export function LexicalToolbar({ editor }: { editor: LexicalEditor }) {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState<BlockType>("paragraph");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    setIsBold(selection.hasFormat("bold"));
    setIsItalic(selection.hasFormat("italic"));
    setIsUnderline(selection.hasFormat("underline"));

    const anchorNode = selection.anchor.getNode();
  const element =
      anchorNode.getKey() === "root"
        ? anchorNode
        : $findMatchingParent(anchorNode, (node) => {
            const parent = node.getParent();
            return parent !== null && parent.getKey() === "root";
          }) ?? anchorNode;

    if ($isHeadingNode(element)) {
      setBlockType(element.getTag() as BlockType);
      return;
    }
    if ($isCodeNode(element)) {
      setBlockType("code");
      return;
    }
    if (element.getType() === "quote") {
      setBlockType("quote");
      return;
    }

    const parentList = $getNearestNodeOfType(anchorNode, ListNode);
    if (parentList) {
      setBlockType(parentList.getListType() === "bullet" ? "bullet" : "number");
      return;
    }

    setBlockType("paragraph");

    const maybeLink = $findMatchingParent(anchorNode, $isLinkNode);
    if ($isLinkNode(maybeLink)) {
      setLinkUrl(maybeLink.getURL());
    } else {
      setLinkUrl("");
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        1,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        1,
      ),
    );
  }, [editor, updateToolbar]);

  function formatBlock(type: BlockType) {
    if (type === "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      return;
    }
    if (type === "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      return;
    }

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (type === "paragraph") {
        if (blockType === "bullet" || blockType === "number") {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        }
        $setBlocksType(selection, () => $createParagraphNode());
        return;
      }
      if (type === "quote") {
        $setBlocksType(selection, () => $createQuoteNode());
        return;
      }
      if (type === "code") {
        if (!$isCodeNode(selection.anchor.getNode())) {
          $setBlocksType(selection, () => $createCodeNode());
          const codeNode = selection.anchor.getNode();
          if ($isCodeNode(codeNode)) {
            codeNode.setLanguage("javascript");
          }
        }
        return;
      }
      if (type === "h1" || type === "h2" || type === "h3") {
        $setBlocksType(selection, () => $createHeadingNode(type));
      }
    });
  }

  function applyLink() {
    const url = linkUrl.trim();
    if (!url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  }

  return (
    <div className="lexical-toolbar flex flex-wrap items-center gap-2 border-b border-[var(--dash-border)] bg-[var(--dash-surface)] p-2">
      <ButtonGroup size="small" variant="outlined">
        <Button disabled={!canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
          Undo
        </Button>
        <Button disabled={!canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
          Redo
        </Button>
      </ButtonGroup>
      <ButtonGroup size="small" variant="outlined">
        <Button
          variant={isBold ? "contained" : "outlined"}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        >
          B
        </Button>
        <Button
          variant={isItalic ? "contained" : "outlined"}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        >
          I
        </Button>
        <Button
          variant={isUnderline ? "contained" : "outlined"}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        >
          U
        </Button>
      </ButtonGroup>
      <ButtonGroup size="small" variant="outlined">
        <Button onClick={() => formatBlock("paragraph")}>P</Button>
        <Button onClick={() => formatBlock("h1")}>H1</Button>
        <Button onClick={() => formatBlock("h2")}>H2</Button>
        <Button onClick={() => formatBlock("h3")}>H3</Button>
        <Button onClick={() => formatBlock("quote")}>Quote</Button>
        <Button onClick={() => formatBlock("code")}>Code</Button>
        <Button onClick={() => formatBlock("bullet")}>• List</Button>
        <Button onClick={() => formatBlock("number")}>1. List</Button>
      </ButtonGroup>
      <Button
        size="small"
        variant="outlined"
        onClick={() =>
          editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: "3", rows: "3" })
        }
      >
        Table
      </Button>
      <div className="flex flex-wrap items-center gap-1">
        <TextField
          size="small"
          label="Link URL"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="min-w-[200px]"
        />
        <Button size="small" onClick={applyLink}>
          Set link
        </Button>
      </div>
    </div>
  );
}
