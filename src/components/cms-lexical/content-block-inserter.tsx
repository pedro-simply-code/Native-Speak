"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { Plus } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { ContentBlockPreview } from "@/components/cms-lexical/content-block-preview";
import {
  CONTENT_BLOCK_CATALOG,
  CONTENT_BLOCK_CATEGORIES,
} from "@/components/cms-lexical/content-block-catalog";
import {
  insertContentBlock,
  type InsertContentBlockId,
} from "@/components/cms-lexical/insert-content-block";
import { PerfectScrollArea } from "@/components/perfect-scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function pickBlock(
  id: InsertContentBlockId,
  onPick: (id: InsertContentBlockId) => void,
  close: () => void,
) {
  onPick(id);
  close();
}

function BlockInserterCard({
  blockId,
  label,
  description,
  icon: Icon,
  onPick,
  onClose,
}: {
  blockId: InsertContentBlockId;
  label: string;
  description: string;
  icon: (typeof CONTENT_BLOCK_CATALOG)[number]["icon"];
  onPick: (id: InsertContentBlockId) => void;
  onClose: () => void;
}) {
  const activate = () => pickBlock(blockId, onPick, onClose);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={onKeyDown}
      className={cn(
        "flex cursor-pointer flex-col rounded-lg border border-[#15130f]/10 bg-[#faf8f4]/80 p-2.5 text-left transition-colors outline-none",
        "hover:border-sc-accent/40 hover:bg-white hover:shadow-[0_4px_16px_rgba(21,19,15,0.08)]",
        "focus-visible:ring-2 focus-visible:ring-sc-accent/40",
      )}
    >
      <span className="flex items-center gap-2">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-sc-accent/10 text-sc-accent">
          <Icon className="size-3.5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-[11px] font-bold tracking-tight text-[#15130f]">
            {label}
          </span>
          <span className="mt-0.5 block text-[10px] leading-snug text-[#6f6a60]">
            {description}
          </span>
        </span>
      </span>
      <div inert className="pointer-events-none select-none">
        <ContentBlockPreview blockId={blockId} />
      </div>
    </div>
  );
}

function BlockInserterPanel({
  onPick,
}: {
  onPick: (id: InsertContentBlockId) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "focus:ring-sc-accent/40 ml-auto inline-flex h-8 min-w-[9.5rem] items-center justify-center gap-1.5 rounded border border-[#15130f]/15 bg-white px-3 text-[11px] font-semibold tracking-[0.08em] text-sc-accent uppercase transition-colors",
            "hover:border-sc-accent/35 hover:bg-sc-accent/5 focus:ring-2 focus:outline-none",
          )}
        >
          <Plus className="size-3.5 shrink-0" aria-hidden />
          Add block
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className={cn(
          "z-[60] max-h-none w-[min(630px,calc(100vw-2rem))] max-w-none overflow-hidden border-[#15130f]/10 bg-white p-0",
          "shadow-[0_12px_40px_rgba(21,19,15,0.12)]",
        )}
      >
        <div className="border-b border-[#15130f]/8 px-4 py-3">
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#15130f] uppercase">
            Insert block
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[#6f6a60]">
            Choose a section or text block. It is inserted at the cursor in the
            body.
          </p>
        </div>
        <PerfectScrollArea className="max-h-[min(70vh,520px)]">
          <div className="space-y-5 p-4">
            {CONTENT_BLOCK_CATEGORIES.map((category) => {
              const blocks = CONTENT_BLOCK_CATALOG.filter(
                (item) => item.category === category.id,
              );
              if (blocks.length === 0) return null;
              return (
                <div key={category.id}>
                  <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#9a9488] uppercase">
                    {category.label}
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {blocks.map((block) => (
                      <li key={block.id}>
                        <BlockInserterCard
                          blockId={block.id}
                          label={block.label}
                          description={block.description}
                          icon={block.icon}
                          onPick={onPick}
                          onClose={() => setOpen(false)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </PerfectScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function ContentBlockInserter() {
  const [editor] = useLexicalComposerContext();

  return (
    <BlockInserterPanel
      onPick={(id) => {
        insertContentBlock(editor, id);
      }}
    />
  );
}
