"use client";

import { useEffect, useRef } from "react";

export type EditableTextVariant =
  | "eyebrow"
  | "title"
  | "subtitle"
  | "body"
  | "statValue"
  | "statLabel"
  | "stepIndex"
  | "link"
  | "inline";

const VARIANT_CLASS: Record<EditableTextVariant, string> = {
  eyebrow: "block-editable block-editable--eyebrow",
  title: "block-editable block-editable--title",
  subtitle: "block-editable block-editable--subtitle",
  body: "block-editable block-editable--body",
  statValue: "block-editable block-editable--stat-value",
  statLabel: "block-editable block-editable--stat-label",
  stepIndex: "block-editable block-editable--step-index",
  link: "block-editable block-editable--link",
  inline: "block-editable block-editable--inline",
};

type EditableTextProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  variant?: EditableTextVariant;
  multiline?: boolean;
  className?: string;
  ariaLabel?: string;
};

export function EditableText({
  value,
  onChange,
  placeholder = "Click to edit…",
  variant = "body",
  multiline = false,
  className = "",
  ariaLabel,
}: EditableTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const committed = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    if (value !== committed.current) {
      el.textContent = value;
      committed.current = value;
    }
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!el.textContent && value) {
      el.textContent = value;
      committed.current = value;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      role="textbox"
      tabIndex={0}
      contentEditable
      suppressContentEditableWarning
      aria-label={ariaLabel ?? placeholder}
      data-placeholder={placeholder}
      className={`${VARIANT_CLASS[variant]} ${multiline ? "block-editable--multiline" : ""} ${className}`.trim()}
      onBlur={(e) => {
        const next = (e.currentTarget.textContent ?? "").trim();
        committed.current = next;
        onChange(next);
      }}
      onKeyDown={(e) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    />
  );
}
