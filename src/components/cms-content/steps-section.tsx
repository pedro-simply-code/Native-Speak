"use client";

import { ArchImageFrame } from "@/components/marketing/arch-image-frame";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import type { StepsSectionData } from "@/lib/cms/site-page-sections";

/** How-it-works style process block. */
export function StepsSection({ data }: { data: StepsSectionData }) {
  const title = data.headline.replace(/\n/g, " ").trim();

  return (
    <section className="mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6">
      <Reveal>
        <SectionHeading
          eyebrow={data.eyebrow || undefined}
          title={title}
          description={data.subtitle}
        />
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {data.steps.map((item, index) => (
            <li key={`${item.title}-${index}`}>
              <Reveal delayMs={index * 70}>
                <article className="mk-card mk-card--lift flex h-full gap-4 p-5">
                  <p
                    className="font-[family-name:var(--font-display)] text-2xl font-semibold tabular-nums text-[var(--theme-accent)]"
                    aria-hidden
                  >
                    {item.step ?? String(index + 1).padStart(2, "0")}
                  </p>
                  <div className="min-w-0">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--theme-ink)]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--theme-muted)]">
                      {item.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>

        {data.image && data.imageAlt ? (
          <Reveal delayMs={120} className="lg:sticky lg:top-28">
            <ArchImageFrame className="aspect-[4/3] w-full">
              <MarketingImage
                src={data.image}
                alt={data.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </ArchImageFrame>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
