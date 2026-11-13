"use client";

import { useEffect, useId, useRef, useState } from "react";
import { IconLanguage } from "@tabler/icons-react";
import {
  localeLabels,
  locales,
  type AppLocale,
} from "@/lib/i18n/config";
import { useAppI18n } from "@/components/i18n/app-i18n-provider";
import { useMarketingContent } from "@/lib/i18n/hooks/use-marketing-content";

export function MarketingLanguageMenu() {
  const { locale, setLocale } = useAppI18n();
  const m = useMarketingContent();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${m.ui.language}: ${localeLabels[locale].native}`}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-[2.375rem] w-[2.375rem] shrink-0 items-center justify-center rounded-[var(--theme-radius-sm)] text-[var(--theme-muted)] transition-colors hover:bg-[var(--theme-surface)] hover:text-[var(--theme-primary-deep)]"
      >
        <IconLanguage size={22} stroke={1.5} aria-hidden />
      </button>

      {open ? (
        <ul
          id={menuId}
          role="menu"
          className="mk-card absolute right-0 top-[calc(100%+0.35rem)] z-50 min-w-[10.5rem] py-1.5 shadow-[var(--theme-shadow-md)]"
        >
          <li
            className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--theme-muted)]"
            role="presentation"
          >
            {m.ui.chooseLanguage}
          </li>
          {locales.map((code) => (
            <li key={code} role="none">
              <button
                type="button"
                role="menuitem"
                className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-medium transition-colors ${
                  code === locale
                    ? "bg-[var(--theme-surface)] text-[var(--theme-primary-deep)]"
                    : "text-[var(--theme-ink)] hover:bg-[var(--theme-surface)] hover:text-[var(--theme-primary-deep)]"
                }`}
                onClick={() => {
                  setLocale(code as AppLocale);
                  setOpen(false);
                }}
              >
                <span aria-hidden>{localeLabels[code].flag}</span>
                {localeLabels[code].native}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
