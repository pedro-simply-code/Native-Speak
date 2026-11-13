"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type LinkFieldValue,
  EMPTY_LINK_FIELD,
} from "@/lib/cms/link-options";
import {
  appGhostButtonLg,
  appInputOnMuted,
  appPrimaryButtonStudioSm,
} from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export type { LinkFieldValue };

type LinkUrlPopoverProps = {
  value: LinkFieldValue;
  onSave: (value: LinkFieldValue) => void;
  trigger: ReactNode;
  title?: string;
  hint?: string;
  placeholder?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  /** Called when the popover opens; overrides `value` for the initial draft. */
  onPrepare?: () => LinkFieldValue;
};

export function LinkUrlPopover({
  value,
  onSave,
  trigger,
  title = "Link URL",
  hint = "Leave URL empty to remove the link.",
  placeholder = "https:// or /path",
  align = "end",
  side = "top",
  onPrepare,
}: LinkUrlPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<LinkFieldValue>(value);

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(onPrepare?.() ?? value);
    setOpen(next);
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    onSave({
      href: draft.href.trim(),
      newTab: draft.newTab,
      nofollow: draft.nofollow,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={8}
        className={cn(
          "w-[min(calc(100vw-2rem),22rem)] border border-[#15130f]/10 bg-white p-4",
          "shadow-[0_8px_24px_rgba(21,19,15,0.14)]",
        )}
        onOpenAutoFocus={(event) => {
          const root = event.currentTarget;
          if (!(root instanceof HTMLElement)) return;
          const target = root.querySelector("input[type='text']");
          if (target instanceof HTMLInputElement) {
            event.preventDefault();
            target.focus();
            target.select();
          }
        }}
      >
        <form onSubmit={submit} className="space-y-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] text-[#57524a] uppercase">
              {title}
            </p>
            {hint ? (
              <p className="mt-1 text-[11px] leading-relaxed text-[#9a9488]">
                {hint}
              </p>
            ) : null}
          </div>
          <input
            type="text"
            inputMode="url"
            value={draft.href}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, href: event.target.value }))
            }
            placeholder={placeholder}
            className={cn(appInputOnMuted, "font-mono text-xs")}
          />
          <div className="space-y-2 border-t border-[#15130f]/8 pt-3">
            <label className="flex cursor-pointer items-start gap-2 text-xs leading-snug text-[#57524a]">
              <input
                type="checkbox"
                checked={draft.newTab}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    newTab: event.target.checked,
                  }))
                }
                className="mt-0.5 size-3.5 shrink-0 accent-[#15130f]"
              />
              Open in new tab
            </label>
            <label className="flex cursor-pointer items-start gap-2 text-xs leading-snug text-[#57524a]">
              <input
                type="checkbox"
                checked={draft.nofollow}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    nofollow: event.target.checked,
                  }))
                }
                className="mt-0.5 size-3.5 shrink-0 accent-[#15130f]"
              />
              Nofollow{" "}
              <span className="text-[#9a9488]">(discourage search indexing)</span>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={appGhostButtonLg}
            >
              Cancel
            </button>
            <button type="submit" className={appPrimaryButtonStudioSm}>
              Save
            </button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export function linkFieldFromHref(href: string): LinkFieldValue {
  return { ...EMPTY_LINK_FIELD, href };
}

/** Summary for native tooltips on link edit triggers. */
export function linkFieldSummary(value: LinkFieldValue): string {
  if (!value.href.trim()) return "no link";
  const flags: string[] = [];
  if (value.newTab) flags.push("new tab");
  if (value.nofollow) flags.push("nofollow");
  const suffix = flags.length ? ` · ${flags.join(", ")}` : "";
  return `${value.href}${suffix}`;
}
