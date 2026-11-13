"use client";

import {
  $applyNodeReplacement,
  DecoratorNode,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { Settings2 } from "lucide-react";
import { useState, type ReactElement } from "react";
import { BlogPostsSection } from "@/components/cms-content/blog-posts-section";
import { useContentEditorPosts } from "@/components/cms-lexical/content-editor-posts-context";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionCheckbox,
  SectionOptionSelect,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  BLOG_SECTION_NODE_TYPE,
  DEFAULT_BLOG_SECTION,
  normalizeBlogSectionData,
  type BlogSectionData,
} from "@/lib/cms/site-page-sections";

export type SerializedBlogSectionNode = Spread<
  { data: BlogSectionData },
  SerializedLexicalNode
>;

export class BlogSectionNode extends DecoratorNode<ReactElement> {
  __data: BlogSectionData;

  static getType(): string {
    return BLOG_SECTION_NODE_TYPE;
  }

  static clone(node: BlogSectionNode): BlogSectionNode {
    return new BlogSectionNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: SerializedBlogSectionNode): BlogSectionNode {
    return $createBlogSectionNode(
      normalizeBlogSectionData(serializedNode.data),
    );
  }

  constructor(data?: BlogSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeBlogSectionData(data);
  }

  exportJSON(): SerializedBlogSectionNode {
    return {
      ...super.exportJSON(),
      type: BLOG_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-blog-node";
    div.dataset.editorBlock = "blog";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): BlogSectionData {
    return this.getLatest().__data;
  }

  setData(data: BlogSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return <BlogSectionEditor nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createBlogSectionNode(
  data: BlogSectionData = DEFAULT_BLOG_SECTION,
): BlogSectionNode {
  return $applyNodeReplacement(new BlogSectionNode(data));
}

export function $isBlogSectionNode(
  node: LexicalNode | null | undefined,
): node is BlogSectionNode {
  return node instanceof BlogSectionNode;
}

function BlogSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: BlogSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(nodeKey, $isBlogSectionNode);
  const catalogPosts = useContentEditorPosts();
  const [previewEmpty, setPreviewEmpty] = useState(false);
  const posts = previewEmpty ? [] : catalogPosts;

  return (
    <div
      contentEditable={false}
      className="group/block text-sc-ink relative"
      data-editor-block="blog"
    >
      <BlockDecoratorToolbar label="Blog" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Blog posts"
          description="Same grid layout as the Projects block: all published posts, paginated (no tag filter)."
        >
          <SectionOptionSelect
            label="Posts per page"
            value={data.pageSize}
            onChange={(value) =>
              update({
                pageSize: Math.min(
                  24,
                  Math.max(3, Number(value) || DEFAULT_BLOG_SECTION.pageSize),
                ),
              })
            }
            options={[6, 9, 12, 15, 18].map((count) => ({
              value: count,
              label: `${count} posts`,
            }))}
          />
          <SectionOptionCheckbox
            label="Preview empty state (editor only)"
            checked={previewEmpty}
            onChange={setPreviewEmpty}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <BlogPostsSection
        data={data}
        posts={posts}
        emptyMessageOverride={
          <InlineText
            value={data.emptyMessage}
            onChange={(v) => update({ emptyMessage: v })}
            className="block"
          />
        }
      />
    </div>
  );
}
