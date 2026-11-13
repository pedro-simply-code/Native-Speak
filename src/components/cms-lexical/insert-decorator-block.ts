"use client";

import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isTextNode,
  DecoratorNode,
  type LexicalNode,
} from "lexical";
import { HeroNode } from "@/components/cms-lexical/hero-node";
import { CtaSectionNode } from "@/components/cms-lexical/cta-node";
import { PageHeaderSectionNode } from "@/components/cms-lexical/page-header-node";
import { PageIntroSectionNode } from "@/components/cms-lexical/page-intro-node";
import { FeatureGridSectionNode } from "@/components/cms-lexical/feature-grid-node";
import { StepsSectionNode } from "@/components/cms-lexical/steps-node";
import { BlogSectionNode } from "@/components/cms-lexical/blog-node";
import { MARKETING_SECTION_DECORATOR_TYPES } from "@/components/cms-lexical/marketing-block-nodes";

const BLOCK_DECORATOR_TYPES = new Set<string>([
  HeroNode.getType(),
  CtaSectionNode.getType(),
  PageHeaderSectionNode.getType(),
  PageIntroSectionNode.getType(),
  FeatureGridSectionNode.getType(),
  StepsSectionNode.getType(),
  BlogSectionNode.getType(),
  ...MARKETING_SECTION_DECORATOR_TYPES,
]);

export function registerBlockDecoratorType(type: string) {
  BLOCK_DECORATOR_TYPES.add(type);
}

function $isBlockDecorator(node: LexicalNode): boolean {
  return BLOCK_DECORATOR_TYPES.has(node.getType());
}

/** Lift block decorators out of paragraphs so DOM is `<div>` siblings, not inside `<p>`. */
export function $reconcileBlockDecoratorsAtRoot(): boolean {
  const root = $getRoot();
  let changed = false;

  for (const block of root.getChildren()) {
    if (!$isParagraphNode(block)) continue;

    const decorators = block.getChildren().filter($isBlockDecorator);
    if (decorators.length === 0) continue;

    let anchor: LexicalNode = block;
    for (const decorator of decorators) {
      anchor.insertAfter(decorator);
      anchor = decorator;
      changed = true;
    }

    $removeEmptyParagraph(block);
  }

  if (changed) {
    $stripLeadingEmptyRootParagraphs();
  }

  return changed;
}

export function $finalizeDecoratorDocument() {
  while ($reconcileBlockDecoratorsAtRoot()) {
    /* e.g. two decorators in one paragraph */
  }
}

export function $getRootChildBlock(node: LexicalNode): LexicalNode | null {
  let current: LexicalNode | null = node;
  while (current !== null) {
    const parent = current.getParent();
    if (parent !== null && parent.getType() === "root") return current;
    current = parent;
  }
  return null;
}

export function $isEmptyParagraph(node: LexicalNode | null): boolean {
  if (node === null || !$isParagraphNode(node)) return false;

  for (const child of node.getChildren()) {
    if ($isTextNode(child)) {
      if (child.getTextContent().trim() !== "") return false;
      continue;
    }
    if (child.getType() === "linebreak") continue;
    if ($isBlockDecorator(child)) return false;
    return false;
  }

  return true;
}

export function $removeEmptyParagraph(node: LexicalNode | null) {
  if (node !== null && $isEmptyParagraph(node)) node.remove();
}

export function $promoteDecoratorOutOfParagraph(decorator: LexicalNode) {
  const parent = decorator.getParent();
  if (!$isParagraphNode(parent)) return;
  parent.insertAfter(decorator);
  $removeEmptyParagraph(parent);
}

/** Keep lifting until the decorator is a direct child of root. */
export function $ensureDecoratorAtRoot(decorator: LexicalNode) {
  while ($isParagraphNode(decorator.getParent())) {
    $promoteDecoratorOutOfParagraph(decorator);
  }
}

function $ensureTrailingEmptyParagraph() {
  const root = $getRoot();
  const last = root.getLastChild();
  if (last !== null && $isEmptyParagraph(last)) return;
  root.append($createParagraphNode());
}

/** Remove empty paragraphs at the start of the document (insert artifacts). */
export function $stripLeadingEmptyRootParagraphs() {
  const root = $getRoot();
  while ($isEmptyParagraph(root.getFirstChild())) {
    root.getFirstChild()?.remove();
  }
}

export function $insertDecoratorBlock(createNode: () => LexicalNode) {
  const block = createNode();
  const selection = $getSelection();
  const root = $getRoot();

  if ($isRangeSelection(selection)) {
    const rootBlock = $getRootChildBlock(selection.anchor.getNode());

    if (rootBlock !== null && $isParagraphNode(rootBlock)) {
      if ($isEmptyParagraph(rootBlock)) {
        rootBlock.replace(block);
      } else {
        rootBlock.insertAfter(block);
      }
    } else if (rootBlock !== null && $isElementNode(rootBlock)) {
      rootBlock.insertAfter(block);
    } else {
      root.append(block);
    }
  } else {
    const first = root.getFirstChild();
    if (
      first !== null &&
      $isEmptyParagraph(first) &&
      first.getNextSibling() === null
    ) {
      first.replace(block);
    } else {
      root.append(block);
    }
  }

  if (block instanceof DecoratorNode) {
    $ensureDecoratorAtRoot(block);
  }

  $stripLeadingEmptyRootParagraphs();
  $removeEmptyParagraph(block.getPreviousSibling());
  $removeEmptyParagraph(block.getNextSibling());
  $finalizeDecoratorDocument();
  $ensureTrailingEmptyParagraph();
}

/** Insert paragraph, heading, or quote at the current block — no split mid-paragraph. */
export function $insertProseBlock(createNode: () => LexicalNode) {
  const block = createNode();
  const selection = $getSelection();
  const root = $getRoot();

  if ($isRangeSelection(selection)) {
    const rootBlock = $getRootChildBlock(selection.anchor.getNode());

    if (rootBlock !== null && $isParagraphNode(rootBlock)) {
      if ($isEmptyParagraph(rootBlock)) {
        rootBlock.replace(block);
      } else {
        rootBlock.insertAfter(block);
      }
    } else if (rootBlock !== null && $isElementNode(rootBlock)) {
      rootBlock.insertAfter(block);
    } else {
      root.append(block);
    }
  } else {
    const first = root.getFirstChild();
    if (
      first !== null &&
      $isEmptyParagraph(first) &&
      first.getNextSibling() === null
    ) {
      first.replace(block);
    } else {
      const last = root.getLastChild();
      if (last !== null && $isEmptyParagraph(last)) {
        last.replace(block);
      } else {
        root.append(block);
      }
    }
  }

  $stripLeadingEmptyRootParagraphs();
  $removeEmptyParagraph(block.getPreviousSibling());
  $removeDuplicateEmptyParagraphAfter(block);
  $ensureTrailingEmptyParagraph();

  if ($isElementNode(block)) {
    block.selectStart();
  }
}

function $removeDuplicateEmptyParagraphAfter(block: LexicalNode) {
  const next = block.getNextSibling();
  if (next === null || !$isEmptyParagraph(next)) return;
  const afterNext = next.getNextSibling();
  if (afterNext !== null && $isEmptyParagraph(afterNext)) {
    afterNext.remove();
  }
}
