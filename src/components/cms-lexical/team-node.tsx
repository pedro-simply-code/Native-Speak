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
import { type ReactElement } from "react";
import { TeamGrid } from "@/components/team-grid";
import { TEAM } from "@/cms-seed-content/team";
import {
  BlockDecoratorToolbar,
  InlineText,
  SectionOptionSelect,
  SectionOptionsDialog,
  useSectionNodeUpdate,
} from "@/components/cms-lexical/decorator-section-shared";
import {
  DEFAULT_TEAM_SECTION,
  normalizeTeamSectionData,
  TEAM_SECTION_NODE_TYPE,
  type TeamSectionData,
} from "@/lib/cms/site-page-sections";
import { appPanelMuted, appSectionBand, appSectionContainer } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export type SerializedTeamSectionNode = Spread<
  { data: TeamSectionData },
  SerializedLexicalNode
>;

export class TeamSectionNode extends DecoratorNode<ReactElement> {
  __data: TeamSectionData;

  static getType(): string {
    return TEAM_SECTION_NODE_TYPE;
  }

  static clone(node: TeamSectionNode): TeamSectionNode {
    return new TeamSectionNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: SerializedTeamSectionNode): TeamSectionNode {
    return $createTeamSectionNode(normalizeTeamSectionData(serializedNode.data));
  }

  constructor(data?: TeamSectionData, key?: NodeKey) {
    super(key);
    this.__data = normalizeTeamSectionData(data);
  }

  exportJSON(): SerializedTeamSectionNode {
    return {
      ...super.exportJSON(),
      type: TEAM_SECTION_NODE_TYPE,
      version: 1,
      data: this.__data,
    };
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = "content-team-node";
    div.dataset.editorBlock = "team";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  isInline(): boolean {
    return false;
  }

  getData(): TeamSectionData {
    return this.getLatest().__data;
  }

  setData(data: TeamSectionData): this {
    const writable = this.getWritable();
    writable.__data = data;
    return writable;
  }

  decorate(): ReactElement {
    return <TeamSectionEditor nodeKey={this.getKey()} data={this.__data} />;
  }
}

export function $createTeamSectionNode(
  data: TeamSectionData = DEFAULT_TEAM_SECTION,
): TeamSectionNode {
  return $applyNodeReplacement(new TeamSectionNode(data));
}

export function $isTeamSectionNode(
  node: LexicalNode | null | undefined,
): node is TeamSectionNode {
  return node instanceof TeamSectionNode;
}

function TeamSectionEditor({
  nodeKey,
  data,
}: {
  nodeKey: NodeKey;
  data: TeamSectionData;
}) {
  const { update, remove } = useSectionNodeUpdate(nodeKey, $isTeamSectionNode);

  return (
    <div
      contentEditable={false}
      className="group/block relative"
      data-editor-block="team"
    >
      <BlockDecoratorToolbar label="Team" onRemove={remove}>
        <SectionOptionsDialog
          triggerLabel="Section options"
          icon={Settings2}
          title="Team section"
        >
          <SectionOptionSelect
            label="Background"
            value={data.surface}
            onChange={(value) =>
              update({ surface: value === "alt" ? "alt" : "default" })
            }
            options={[
              { value: "default", label: "Default band" },
              { value: "alt", label: "Alt band" },
            ]}
          />
        </SectionOptionsDialog>
      </BlockDecoratorToolbar>
      <section
        className={cn(
          appSectionBand,
          "border-b border-[#15130f]/10 py-16 lg:py-24",
          data.surface === "alt" ? "bg-sc-section-alt" : "bg-sc-section",
        )}
      >
        <div className={appSectionContainer}>
          <div className="mb-14 max-w-2xl">
            <InlineText
              as="p"
              value={data.eyebrow}
              onChange={(eyebrow) => update({ eyebrow })}
              className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase"
            />
            <InlineText
              as="h2"
              value={data.headline}
              onChange={(headline) => update({ headline })}
              className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase whitespace-pre-line"
            />
            <InlineText
              as="p"
              value={data.description}
              onChange={(description) => update({ description })}
              className="mt-6 text-[16px] leading-relaxed text-[#57524a]"
            />
          </div>
          <TeamGrid members={TEAM} />
          <p className={cn(appPanelMuted, "mt-6 px-4 py-3 text-center text-xs text-[#6f6a60]")}>
            Published pages load team members from Studio → Team.
          </p>
        </div>
      </section>
    </div>
  );
}
