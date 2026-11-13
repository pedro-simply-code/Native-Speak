"use client";

import type { ReactNode } from "react";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { Reveal } from "@/components/marketing/reveal";
import type { CtaSectionData } from "@/lib/cms/homepage-sections";

export function CtaMarketingSection({
  data,
  className,
  headlineOverride,
  descriptionOverride,
  actionsOverride,
}: {
  data: CtaSectionData;
  className?: string;
  headlineOverride?: ReactNode;
  descriptionOverride?: ReactNode;
  actionsOverride?: ReactNode;
}) {
  const title = data.headline.replace(/\n/g, " ").trim();

  return (
    <section
      className={`mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6 ${className ?? ""}`}
    >
      <Reveal>
        <div className="mk-card mk-card--lift flex flex-col gap-6 rounded-[var(--theme-radius-xl)] border border-[var(--theme-line)] bg-[var(--theme-surface)] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-xl">
            {headlineOverride ?? (
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--theme-ink)] sm:text-3xl">
                {title}
              </h2>
            )}
            {descriptionOverride ??
              (data.description ? (
                <p className="mt-3 text-sm leading-relaxed text-[var(--theme-muted)] sm:text-base">
                  {data.description}
                </p>
              ) : null)}
          </div>
          {actionsOverride ?? (
            <MarketingButton href={data.buttonHref || "/free-class"}>
              {data.buttonLabel || "Try a free class"}
            </MarketingButton>
          )}
        </div>
      </Reveal>
    </section>
  );
}
