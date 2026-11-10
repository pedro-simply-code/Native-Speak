"use client";

import Link from "next/link";
import { useState } from "react";
import {
  programLevels,
  programs,
  programsSection,
  type ProgramLevelId,
} from "@/lib/marketing/home-content";
import { marketingImages } from "@/lib/marketing/images";
import { programIdToSlug } from "@/lib/marketing/navigation";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";

const defaultLevel: ProgramLevelId = "preschool";

export function ProgramsSection() {
  const [active, setActive] = useState<ProgramLevelId>(defaultLevel);
  const detail = programs[active];
  const imageSrc = marketingImages.programs[active];

  return (
    <section
      id="programs"
      className="border-y mk-section"
      style={{
        borderColor: "var(--theme-line)",
        borderWidth: "var(--theme-border-width) 0",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--theme-surface) 55%, var(--theme-paper)) 0%, var(--theme-paper) 100%)",
      }}
    >
      <div className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Programs"
            title={programsSection.title}
            description={programsSection.subtitle}
          />
        </Reveal>

        <div
          className="mk-segmented mt-8"
          role="tablist"
          aria-label="Program levels"
        >
          {programLevels.map((level) => {
            const selected = level.id === active;
            return (
              <button
                key={level.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(level.id)}
                className="px-4 py-2 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  borderRadius: "var(--theme-radius-button)",
                  background: selected
                    ? "var(--theme-primary-deep)"
                    : "transparent",
                  color: selected ? "#fff" : "var(--theme-primary-deep)",
                  boxShadow: selected ? "var(--theme-shadow-sm)" : "none",
                }}
              >
                {level.label}
              </button>
            );
          })}
        </div>

        <article
          className="mk-card mk-card--lift mt-6 grid overflow-hidden lg:grid-cols-[1fr_1.05fr]"
          role="tabpanel"
          style={{ borderRadius: "var(--theme-radius-xl)" }}
        >
          <div className="p-8 lg:p-10">
            <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)]">
              {detail.title}
            </h3>
            {detail.meta ? (
              <p className="mt-2 text-sm font-medium text-[var(--theme-accent)]">
                {detail.meta}
              </p>
            ) : null}
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--theme-muted)]">
              {detail.body}
            </p>
            <Link
              href={`/programs/${programIdToSlug[active]}`}
              className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--theme-primary)] transition-transform hover:translate-x-0.5"
            >
              View {detail.title} program →
            </Link>
          </div>
          <figure className="relative min-h-[240px] overflow-hidden lg:min-h-full">
            <MarketingImage
              key={active}
              src={imageSrc}
              alt={`${detail.title} Spanish program`}
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="motion-program-image"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, color-mix(in srgb, var(--theme-paper) 35%, transparent) 0%, transparent 45%)",
              }}
            />
          </figure>
        </article>
      </div>
    </section>
  );
}
