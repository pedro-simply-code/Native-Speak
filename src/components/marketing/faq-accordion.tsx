"use client";

import { useId, useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <ul className="divide-y" style={{ borderColor: "var(--theme-line)" }}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `${baseId}-${index}`;
        return (
          <li key={item.question}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-start justify-between gap-4 py-4 text-left text-sm font-semibold text-[var(--theme-ink)]"
            >
              {item.question}
              <span
                className={`mt-0.5 shrink-0 text-[var(--theme-muted)] transition-transform duration-200 ${
                  open ? "rotate-45" : ""
                }`}
                aria-hidden
              >
                +
              </span>
            </button>
            {open ? (
              <p
                id={panelId}
                className="pb-4 text-sm leading-relaxed text-[var(--theme-muted)]"
              >
                {item.answer}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
