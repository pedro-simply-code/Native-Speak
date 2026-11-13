"use client";

import type { ComponentType } from "react";
import { MessageSquare } from "lucide-react";
import type { FeatureGridIcon } from "@/lib/cms/site-page-sections";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import type { FeatureGridSectionData } from "@/lib/cms/site-page-sections";

/** Editor chrome only — public cards no longer show Lucide icons. */
export function featureGridIcon(
  _icon: FeatureGridIcon,
): ComponentType<{ className?: string }> {
  return MessageSquare;
}

/** Three-column benefit cards (programs / class structure). */
export function FeatureGridSection({
  data,
  hideHeader = false,
  gridOnly = false,
}: {
  data: FeatureGridSectionData;
  hideHeader?: boolean;
  gridOnly?: boolean;
}) {
  const title = data.headline.replace(/\n/g, " ").trim();

  const grid = (
    <ul className="mt-10 grid gap-5 md:grid-cols-3">
      {data.features.map((feature, index) => (
        <li key={`${feature.title}-${index}`}>
          <Reveal delayMs={index * 70}>
            <article className="mk-card mk-card--lift h-full p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--theme-ink)]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--theme-muted)]">
                {feature.body}
              </p>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  );

  if (gridOnly) return grid;

  return (
    <section className="mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6">
      {!hideHeader ? (
        <Reveal>
          <SectionHeading
            eyebrow={data.eyebrow || undefined}
            title={title}
            description={data.description}
          />
        </Reveal>
      ) : null}
      {grid}
    </section>
  );
}
