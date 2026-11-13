"use client";

import Link from "next/link";
import { useState } from "react";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { PricingPlanPicker } from "@/components/marketing/pricing-plan-picker";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { StaticDemoForm } from "@/components/marketing/static-demo-form";
import type {
  BlogHeaderSectionData,
  BulletCtaSectionData,
  BulletListSectionData,
  DualCtaSectionData,
  FaqSectionData,
  LeadFormSectionData,
  OnboardingTrioSectionData,
  ProgramDetailSectionData,
  ProgramsGridSectionData,
  ProgramsShowcaseSectionData,
  ProgressSectionData,
  TestimonialsSectionData,
} from "@/lib/cms/marketing-blocks";

export function OnboardingTrioSection({
  data,
}: {
  data: OnboardingTrioSectionData;
}) {
  return (
    <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6 lg:-mt-4">
      <ol className="grid gap-5 md:grid-cols-3">
        {data.items.map((step, index) => (
          <li key={`${step.title}-${index}`}>
            <Reveal delayMs={index * 60}>
              <article
                className="mk-card mk-card--lift h-full border-t-[3px] p-6"
                style={{ borderTopColor: "var(--theme-accent)" }}
              >
                <p
                  className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wide text-[var(--theme-accent)]"
                  aria-hidden
                >
                  {data.stepLabelTemplate.replace("{n}", String(index + 1))}
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--theme-ink)]">
                  {step.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--theme-muted)]">
                  {step.body}
                </p>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function BulletListSection({ data }: { data: BulletListSectionData }) {
  return (
    <section className="mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6">
      <Reveal>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)] sm:text-3xl">
          {data.title}
        </h2>
        {data.intro ? (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--theme-muted)]">
            {data.intro}
          </p>
        ) : null}
        <ul className="mt-6 space-y-3">
          {data.bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex gap-3 text-sm text-[var(--theme-ink)]"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: "var(--theme-primary-deep)" }}
              />
              {bullet}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

export function BulletCtaSection({ data }: { data: BulletCtaSectionData }) {
  return (
    <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
      <Reveal className="mx-auto max-w-3xl">
        <ul className="space-y-4">
          {data.bullets.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-[var(--theme-radius-md)] border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--theme-line)",
                background: "var(--theme-surface)",
              }}
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ background: "var(--theme-accent)" }}
              />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <MarketingButton href={data.buttonHref}>{data.buttonLabel}</MarketingButton>
        </div>
      </Reveal>
    </section>
  );
}

export function FaqMarketingSection({ data }: { data: FaqSectionData }) {
  return (
    <section
      id="faq"
      className="mk-section border-t mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6"
      style={{ borderColor: "var(--theme-line)" }}
    >
      <Reveal>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)] sm:text-3xl">
          {data.title}
        </h2>
        <p className="mt-2 text-sm text-[var(--theme-muted)]">
          {data.introBefore}{" "}
          <Link
            href={data.introLinkHref}
            className="font-semibold text-[var(--theme-primary)]"
          >
            {data.introLinkLabel}
          </Link>
          {data.introAfter}
        </p>
      </Reveal>
      <div className="mk-card mt-8 p-5 sm:p-6">
        <FaqAccordion items={data.items} />
      </div>
    </section>
  );
}

export function DualCtaSection({ data }: { data: DualCtaSectionData }) {
  return (
    <section className="mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 pb-16 sm:px-6">
      <Reveal className="mk-footer-cta flex flex-col items-start justify-between gap-4 p-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)]">
            {data.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--theme-muted)]">{data.body}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MarketingButton href={data.primaryHref}>
            {data.primaryLabel}
          </MarketingButton>
          <MarketingButton href={data.secondaryHref} variant="soft">
            {data.secondaryLabel}
          </MarketingButton>
        </div>
      </Reveal>
    </section>
  );
}

export function TestimonialsSection({ data }: { data: TestimonialsSectionData }) {
  return (
    <section
      className="mk-section border-t"
      style={{ borderColor: "var(--theme-line)" }}
    >
      <div className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6">
        <Reveal>
          <h2 className="max-w-3xl font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)] sm:text-3xl">
            {data.title}
          </h2>
        </Reveal>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {data.items.map((item, index) => (
            <li key={`${item.author}-${index}`}>
              <Reveal delayMs={index * 80}>
                <blockquote className="mk-card mk-card--lift relative h-full p-6 pt-8">
                  <span
                    className="mk-quote-mark absolute right-5 top-3"
                    aria-hidden
                  >
                    &ldquo;
                  </span>
                  <p className="text-sm leading-relaxed text-[var(--theme-ink)]">
                    {item.quote}
                  </p>
                  <footer className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--theme-muted)]">
                    {item.author}
                  </footer>
                </blockquote>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function LeadFormSection({ data }: { data: LeadFormSectionData }) {
  return (
    <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
      <Reveal className="mx-auto max-w-lg">
        <div
          className="border p-8"
          style={{
            borderColor: "var(--theme-line)",
            borderRadius: "var(--theme-radius-xl)",
            boxShadow: "var(--theme-shadow-md)",
            background: "var(--theme-paper)",
          }}
        >
          <StaticDemoForm submitLabel={data.submitLabel} />
        </div>
      </Reveal>
    </section>
  );
}

export function PricingPickerSection() {
  return (
    <section className="pb-14 pt-2 lg:pb-16">
      <PricingPlanPicker />
    </section>
  );
}

export function ProgressMarketingSection({ data }: { data: ProgressSectionData }) {
  return (
    <section
      id="expectations"
      className="mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6"
    >
      <Reveal>
        <SectionHeading
          eyebrow={data.eyebrow}
          title={data.title}
          description={data.subtitle}
        />
      </Reveal>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Reveal delayMs={60}>
          <div className="mk-card bg-[var(--theme-surface)] p-6">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--theme-ink)]">
              {data.leftTitle}
            </h3>
            <p className="text-sm font-medium text-[var(--theme-muted)]">
              {data.leftSubtitle}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--theme-ink)]">
              {data.leftRows.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delayMs={120}>
          <div className="mk-card p-6">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--theme-ink)]">
              {data.rightTitle}
            </h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {data.rightItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-[var(--theme-ink)]"
                >
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: "var(--theme-accent)" }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
      <Reveal
        delayMs={160}
        className="mk-card mk-card--lift mt-10 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center"
      >
        <p className="max-w-xl text-sm text-[var(--theme-muted)]">{data.ctaBody}</p>
        <MarketingButton href={data.ctaHref}>{data.ctaLabel}</MarketingButton>
      </Reveal>
    </section>
  );
}

export function ProgramsShowcaseSection({
  data,
}: {
  data: ProgramsShowcaseSectionData;
}) {
  const [active, setActive] = useState(0);
  const level = data.levels[active] ?? data.levels[0];
  if (!level) return null;

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
          <SectionHeading title={data.title} description={data.subtitle} />
        </Reveal>
        <div
          className="mk-segmented mt-8"
          role="tablist"
          aria-label="Program levels"
        >
          {data.levels.map((l, index) => {
            const selected = index === active;
            return (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(index)}
                className="px-4 py-2 text-sm font-semibold transition-all duration-300"
                style={{
                  borderRadius: "var(--theme-radius-button)",
                  background: selected
                    ? "var(--theme-primary-deep)"
                    : "transparent",
                  color: selected ? "#fff" : "var(--theme-primary-deep)",
                  boxShadow: selected ? "var(--theme-shadow-sm)" : "none",
                }}
              >
                {l.label}
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
              {level.title}
            </h3>
            {level.meta ? (
              <p className="mt-2 text-sm font-medium text-[var(--theme-accent)]">
                {level.meta}
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-relaxed text-[var(--theme-muted)]">
              {level.body}
            </p>
            <Link
              href={level.href}
              className="mt-6 inline-flex text-sm font-semibold text-[var(--theme-primary)]"
            >
              View program →
            </Link>
          </div>
          <figure className="relative min-h-[240px]">
            <MarketingImage
              src={level.imageSrc}
              alt={level.title}
              fill
              sizes="(max-width: 1024px) 100vw, 540px"
            />
          </figure>
        </article>
      </div>
    </section>
  );
}

export function ProgramsGridSection({ data }: { data: ProgramsGridSectionData }) {
  return (
    <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6 lg:py-16">
      <ul className="grid gap-6 md:grid-cols-2">
        {data.cards.map((card, index) => (
          <li key={`${card.href}-${index}`} className="h-full">
            <Reveal delayMs={index * 70} className="h-full">
              <Link
                href={card.href}
                className="mk-card mk-card--lift group grid h-full overflow-hidden md:grid-cols-[1.1fr_1fr]"
                style={{ borderRadius: "var(--theme-radius-lg)" }}
              >
                <div className="flex h-full flex-col p-6">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)]">
                    {card.title}
                  </h2>
                  {card.meta ? (
                    <p className="mt-2 text-sm text-[var(--theme-accent)]">
                      {card.meta}
                    </p>
                  ) : null}
                  <p className="mt-3 line-clamp-3 text-sm text-[var(--theme-muted)]">
                    {card.body}
                  </p>
                  <span className="mt-auto inline-block pt-4 text-sm font-semibold text-[var(--theme-primary)]">
                    Learn more →
                  </span>
                </div>
                <figure className="relative min-h-[180px] md:h-full md:min-h-0">
                  <MarketingImage
                    src={card.imageSrc}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </figure>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProgramDetailSection({
  data,
}: {
  data: ProgramDetailSectionData;
}) {
  return (
    <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-12 sm:px-6">
      <Reveal>
        {data.meta ? (
          <p className="text-sm font-semibold text-[var(--theme-accent)]">
            {data.meta}
          </p>
        ) : null}
        <p className="mt-4 text-base leading-relaxed text-[var(--theme-muted)]">
          {data.body}
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {data.chips.map((item) => (
            <li
              key={item}
              className="rounded-[var(--theme-radius-md)] border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--theme-line)",
                background: "var(--theme-surface)",
              }}
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <MarketingButton href={data.primaryHref}>
            {data.primaryLabel}
          </MarketingButton>
          <MarketingButton href={data.secondaryHref} variant="soft">
            {data.secondaryLabel}
          </MarketingButton>
          <Link
            href={data.backHref}
            className="inline-flex items-center px-4 text-sm font-semibold text-[var(--theme-muted)] hover:text-[var(--theme-primary)]"
          >
            {data.backLabel}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export function BlogHeaderSection({ data }: { data: BlogHeaderSectionData }) {
  return (
    <div className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--theme-ink)]">
          {data.title}
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--theme-muted)]">
          {data.description}
        </p>
      </Reveal>
    </div>
  );
}
