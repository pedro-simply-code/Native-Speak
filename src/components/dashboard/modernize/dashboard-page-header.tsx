"use client";

import type { ReactNode } from "react";

export function DashboardPageHeader({
  title,
  description,
  eyebrow,
  actions,
  border = true,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  /** Subtle rule under the header band (default on). */
  border?: boolean;
}) {
  return (
    <header
      className={border ? "dash-page-header" : undefined}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? <p className="dash-page-eyebrow">{eyebrow}</p> : null}
          <h1 className="dash-page-title">{title}</h1>
          {description ? (
            <p className="dash-page-desc">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
