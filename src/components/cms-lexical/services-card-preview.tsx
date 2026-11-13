"use client";

import type { LucideIcon } from "lucide-react";
import { Database, Globe, Palette, Users, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ServicesSectionCard } from "@/lib/cms/homepage-sections";
import { SERVICES_CARD_ICON_OPTIONS } from "@/lib/cms/services-section-cards";
import { appPanelHover, appPanelMuted, siteCardMotion } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

const ICONS: Record<ServicesSectionCard["icon"], LucideIcon> = {
  palette: Palette,
  database: Database,
  globe: Globe,
  users: Users,
};

function InlineField({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (document.activeElement === element) return;
    if (element.innerText !== value) element.innerText = value;
  }, [value]);

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={placeholder}
      spellCheck
      className={cn("content-inline-edit outline-none", className)}
      onInput={(event) =>
        onChange(event.currentTarget.innerText.replace(/\n/g, " "))
      }
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Enter") event.preventDefault();
      }}
    />
  );
}

export function ServiceCardPreview({
  card,
  editable,
  onUpdate,
  onRemove,
}: {
  card: ServicesSectionCard;
  editable?: boolean;
  onUpdate?: (patch: Partial<ServicesSectionCard>) => void;
  onRemove?: () => void;
}) {
  const Icon = ICONS[card.icon] ?? Palette;

  return (
    <div className={cn(appPanelMuted, appPanelHover, siteCardMotion, "group/card relative p-8")}>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove card"
          className="absolute top-3 right-3 inline-flex size-6 items-center justify-center rounded-full bg-[#15130f]/10 text-[#15130f]/70 opacity-0 transition-opacity group-hover/card:opacity-100 hover:bg-[#15130f]/15"
        >
          <X className="size-3" />
        </button>
      ) : null}
      <div className="mb-6 flex size-14 items-center justify-center bg-[#15130f] text-white">
        <Icon className="size-6" />
      </div>
      {editable && onUpdate ? (
        <>
          <select
            value={card.icon}
            onChange={(event) =>
              onUpdate({
                icon: event.target.value as ServicesSectionCard["icon"],
              })
            }
            className="mb-3 h-8 w-full rounded border border-[#15130f]/10 bg-white px-2 text-[10px] font-bold tracking-[0.08em] uppercase"
          >
            {SERVICES_CARD_ICON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <InlineField
            value={card.title}
            onChange={(value) => onUpdate({ title: value })}
            placeholder="Service title"
            className="block text-lg font-black tracking-tight uppercase"
          />
          <InlineField
            value={card.summary}
            onChange={(value) => onUpdate({ summary: value })}
            placeholder="Summary"
            className="mt-3 block text-[14px] leading-relaxed text-[#57524a]"
          />
        </>
      ) : (
        <>
          <h3 className="text-lg font-black tracking-tight uppercase">
            {card.title}
          </h3>
          <p className="mt-3 text-[14px] leading-relaxed text-[#57524a]">
            {card.summary}
          </p>
        </>
      )}
    </div>
  );
}
