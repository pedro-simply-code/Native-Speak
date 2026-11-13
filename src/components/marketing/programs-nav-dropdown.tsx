"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useMarketingContent } from "@/lib/i18n/hooks/use-marketing-content";

export function ProgramsNavDropdown() {
  const m = useMarketingContent();
  const programsLabel =
    m.primaryNav.find((item) => item.href === "/programs")?.label ?? "Programs";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const pathname = usePathname();
  const [openPathname, setOpenPathname] = useState(pathname);
  /** A route change closes the menu without a setState-inside-effect. */
  const isOpen = open && openPathname === pathname;
  const active =
    pathname === "/programs" || pathname.startsWith("/programs/");

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => {
          setOpenPathname(pathname);
          setOpen((value) => !value);
        }}
        className={`mk-nav-link inline-flex items-center gap-1 rounded-[var(--theme-radius-sm)] px-2.5 py-2 text-sm font-medium transition-colors ${
          active
            ? "mk-nav-link--active text-[var(--theme-primary-deep)]"
            : "text-[var(--theme-muted)] hover:text-[var(--theme-primary-deep)]"
        }`}
      >
        {programsLabel}
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`shrink-0 opacity-70 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m3 4.5 3 3 3-3"
          />
        </svg>
      </button>

      {isOpen ? (
        <ul
          id={menuId}
          role="menu"
          className="mk-card absolute left-0 top-[calc(100%+0.35rem)] z-50 min-w-[11.5rem] py-1.5 shadow-[var(--theme-shadow-md)] lg:left-1/2 lg:-translate-x-1/2"
        >
          {m.programMenuLinks.map((item) => {
            const itemActive = pathname === item.href;
            return (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  className={`block px-3.5 py-2 text-sm font-medium transition-colors ${
                    itemActive
                      ? "bg-[var(--theme-surface)] text-[var(--theme-primary-deep)]"
                      : "text-[var(--theme-ink)] hover:bg-[var(--theme-surface)] hover:text-[var(--theme-primary-deep)]"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
