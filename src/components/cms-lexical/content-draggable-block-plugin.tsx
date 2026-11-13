"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";
import {
  $getNearestNodeFromDOMNode,
  $getNodeByKey,
} from "lexical";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { $getRootChildBlock } from "@/components/cms-lexical/insert-decorator-block";
import { cn } from "@/lib/utils";

const MENU_CLASSNAME = "draggable-block-menu";

type MoveDirection = "up" | "down";

type MoveState = {
  up: boolean;
  down: boolean;
};

const NO_MOVES: MoveState = { up: false, down: false };

type ContentDraggableBlockPluginProps = {
  anchorElem: HTMLElement | null;
};

/**
 * Playground-style drag handle that reorders top-level blocks, plus arrow
 * buttons to nudge the hovered block up/down without a full drag gesture.
 *
 * Ported from `packages/lexical-playground/src/plugins/DraggableBlockPlugin`.
 * The handle and drop line are portaled into `anchorElem`, so they must be
 * absolutely positioned at `top-0 left-0` — the plugin only writes a
 * `transform` (and `display`/`opacity`) and relies on the CSS static position
 * for everything else.
 */
export function ContentDraggableBlockPlugin({
  anchorElem,
}: ContentDraggableBlockPluginProps) {
  const [editor] = useLexicalComposerContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const targetLineRef = useRef<HTMLDivElement>(null);
  const hoveredKeyRef = useRef<string | null>(null);
  const alignTargetRef = useRef<HTMLElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [moves, setMoves] = useState<MoveState>(NO_MOVES);

  /**
   * Publish the handle's vertical centre as a CSS variable on the hovered block
   * so the block's own toolbar (see `BlockDecoratorToolbar`) can line up with
   * the handle. Watching the menu's inline style means we read the rect after
   * `LexicalDraggableBlockPlugin` has written its `transform`.
   */
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const sync = () => {
      const block = alignTargetRef.current;
      if (!block || menu.style.display === "none") return;
      const menuRect = menu.getBoundingClientRect();
      if (menuRect.height === 0) return;
      const blockRect = block.getBoundingClientRect();
      block.style.setProperty(
        "--sc-block-handle-center",
        `${Math.round(menuRect.top - blockRect.top + menuRect.height / 2)}px`,
      );
    };

    const observer = new MutationObserver(sync);
    observer.observe(menu, { attributes: true, attributeFilter: ["style"] });
    sync();
    return () => observer.disconnect();
  }, [anchorElem]);

  // Stable identity: Lexical re-registers the mousemove listeners whenever the
  // `isOnMenu` callback changes, so it must not be re-created on every render.
  const isOnMenu = useCallback(
    (element: HTMLElement) => element.closest(`.${MENU_CLASSNAME}`) !== null,
    [],
  );

  const refreshMoves = useCallback(() => {
    const key = hoveredKeyRef.current;
    if (!key) {
      setMoves(NO_MOVES);
      return;
    }
    editor.read(() => {
      const block = $getNodeByKey(key);
      if (!block) {
        setMoves(NO_MOVES);
        return;
      }
      setMoves({
        up: block.getPreviousSibling() !== null,
        down: block.getNextSibling() !== null,
      });
    });
  }, [editor]);

  const handleElementChanged = useCallback(
    (element: HTMLElement | null) => {
      setIsActive(element !== null);

      if (element === null) {
        hoveredKeyRef.current = null;
        setMoves(NO_MOVES);
        return;
      }

      // The effect above reads this when the plugin writes the handle transform.
      alignTargetRef.current = element;

      editor.read(() => {
        const node = $getNearestNodeFromDOMNode(element);
        const block = node ? ($getRootChildBlock(node) ?? node) : null;
        const key = block ? block.getKey() : null;
        if (key === hoveredKeyRef.current) return;
        hoveredKeyRef.current = key;
        setMoves({
          up: block ? block.getPreviousSibling() !== null : false,
          down: block ? block.getNextSibling() !== null : false,
        });
      });
    },
    [editor],
  );

  const moveHoveredBlock = useCallback(
    (direction: MoveDirection) => {
      const key = hoveredKeyRef.current;
      if (!key) return;

      editor.update(
        () => {
          const node = $getNodeByKey(key);
          if (!node) return;
          const block = $getRootChildBlock(node) ?? node;
          const sibling =
            direction === "up"
              ? block.getPreviousSibling()
              : block.getNextSibling();
          if (!sibling) return;
          if (direction === "up") {
            sibling.insertBefore(block);
          } else {
            sibling.insertAfter(block);
          }
        },
        { onUpdate: refreshMoves },
      );
    },
    [editor, refreshMoves],
  );

  if (!anchorElem) {
    return null;
  }

  return (
    <DraggableBlockPlugin_EXPERIMENTAL
      anchorElem={anchorElem}
      menuRef={menuRef}
      targetLineRef={targetLineRef}
      onElementChanged={handleElementChanged}
      menuComponent={
        <div
          ref={menuRef}
          className={cn(
            MENU_CLASSNAME,
            "absolute top-0 left-0 z-20 -ml-4 flex w-7 cursor-grab flex-col items-stretch overflow-hidden",
            "rounded-md border border-sc-accent/20 bg-white/95 text-[#6f6a60] opacity-0 shadow-md",
            "transition-[opacity,background-color,border-color,box-shadow] select-none",
            "hover:border-sc-accent/40 hover:shadow-lg",
            // Keep the (invisible) handle from swallowing clicks until the
            // plugin has positioned it over a hovered block.
            isActive ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <button
            type="button"
            title="Move block up"
            aria-label="Move block up"
            disabled={!moves.up}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => moveHoveredBlock("up")}
            className={arrowClassName}
          >
            <ChevronUp className="size-3.5" aria-hidden />
          </button>
          <div
            title="Drag to reorder"
            aria-label="Drag to reorder block"
            className="flex h-7 items-center justify-center border-y border-sc-accent/10 text-[#9a9488] active:cursor-grabbing"
          >
            <GripVertical className="size-4" aria-hidden />
          </div>
          <button
            type="button"
            title="Move block down"
            aria-label="Move block down"
            disabled={!moves.down}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => moveHoveredBlock("down")}
            className={arrowClassName}
          >
            <ChevronDown className="size-3.5" aria-hidden />
          </button>
        </div>
      }
      targetLineComponent={
        <div
          ref={targetLineRef}
          className={cn(
            "draggable-block-target-line pointer-events-none absolute top-0 left-0 z-20",
            "h-1 rounded-full bg-sc-accent opacity-0",
          )}
        />
      }
      isOnMenu={isOnMenu}
    />
  );
}

const arrowClassName = cn(
  "flex h-[22px] w-full cursor-pointer items-center justify-center",
  "transition-colors hover:bg-sc-accent/10 hover:text-sc-accent",
  "disabled:cursor-not-allowed disabled:opacity-30",
);
