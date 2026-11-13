"use client";

import type { ReactNode } from "react";

export function BlockAddLine({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" className="block-editable-add" onClick={onClick}>
      {children}
    </button>
  );
}

export function BlockRemoveLine({
  onClick,
  label = "Remove",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button type="button" className="block-editable-remove" onClick={onClick} aria-label={label}>
      ×
    </button>
  );
}
