"use client";

import type { ReactNode } from "react";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { Reveal } from "@/components/marketing/reveal";
import type { PageIntroSectionData } from "@/lib/cms/site-page-sections";

/**
 * About-style split section — pillars on the left, optional image panel on the right.
 * CMS `stats` rows map to pillars: `label` → title, `value` → body.
 */
export function PageIntroSection({
  data,
  contentOverride,
  panelOverride,
}: {
  data: PageIntroSectionData;
  contentOverride?: ReactNode;
  panelOverride?: ReactNode;
}) {
  const pillars = data.stats.filter(
    (row) => row.label.trim() || row.value.trim(),
  );
  const title = data.headline.replace(/\n/g, " ").trim();

  return (
    <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        {contentOverride ?? (
          <Reveal>
            {data.eyebrow ? <p className="mk-eyebrow">{data.eyebrow}</p> : null}
            {title ? (
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--theme-ink)]">
                {title}
              </h2>
            ) : null}
            {data.body ? (
              <p className="mt-4 text-sm leading-relaxed text-[var(--theme-muted)]">
                {data.body}
              </p>
            ) : null}
            {data.bodySecondary ? (
              <p className="mt-3 text-sm leading-relaxed text-[var(--theme-muted)]">
                {data.bodySecondary}
              </p>
            ) : null}
            {pillars.length > 0 ? (
              <ul className="mt-8 space-y-6">
                {pillars.map((pillar, index) => (
                  <li key={`${pillar.label}-${index}`}>
                    <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--theme-ink)]">
                      {pillar.label}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--theme-muted)]">
                      {pillar.value}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>
        )}

        {panelOverride ??
          (data.panelFooter && data.panelEmail.trim() ? (
            <Reveal delayMs={100}>
              <figure
                className="group relative aspect-[4/3] overflow-hidden border"
                style={{
                  borderColor: "var(--theme-line)",
                  borderRadius: "var(--theme-radius-xl)",
                  boxShadow: "var(--theme-shadow-md)",
                }}
              >
                <MarketingImage
                  src={data.panelFooter}
                  alt={data.panelEmail}
                  fill
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="motion-program-image"
                />
              </figure>
            </Reveal>
          ) : null)}
      </div>
    </section>
  );
}
