"use client";

import Link from "next/link";
import { marketingImages } from "@/lib/marketing/images";
import { ArchImageFrame } from "@/components/marketing/arch-image-frame";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { Reveal } from "@/components/marketing/reveal";
import { useMarketingContent } from "@/lib/i18n/hooks/use-marketing-content";

export function HeroSection() {
  const m = useMarketingContent();
  const { hero, heroStats, siteNav, audienceStrip } = m;

  return (
    <section
      className="relative overflow-hidden border-b"
      style={{
        borderColor: "var(--theme-line)",
        borderWidth: "0 0 var(--theme-border-width)",
      }}
    >
      <div
        className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full opacity-35 blur-3xl motion-float-slow"
        style={{ background: "var(--theme-accent)" }}
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full opacity-25 blur-3xl motion-float-slow-reverse"
        style={{ background: "var(--theme-primary-deep)" }}
      />

      <div className="mx-auto grid w-full max-w-[var(--theme-content-max)] gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
        <Reveal>
          <p className="mk-eyebrow">{hero.eyebrow}</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--theme-ink)] sm:text-[3.25rem]">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-[var(--theme-muted)]">
            {hero.subtitle}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {hero.highlights.map((item, index) => (
              <li
                key={item}
                className="motion-chip mk-card rounded-[var(--theme-radius-md)] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wide text-[var(--theme-primary-deep)] shadow-none"
                style={{ animationDelay: `${100 + index * 65}ms` }}
              >
                {item}
              </li>
            ))}
          </ul>

          <ul className="mt-8 grid grid-cols-3 gap-2 sm:max-w-md">
            {heroStats.map((stat) => (
              <li key={stat.label} className="mk-stat">
                <p className="mk-stat__value">{stat.value}</p>
                <p className="mk-stat__label">{stat.label}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MarketingButton href={siteNav.trialHref}>
              {hero.ctaPrimary}
            </MarketingButton>
            <MarketingButton href={siteNav.loginHref} variant="soft">
              {m.ui.logIn}
            </MarketingButton>
          </div>

          <p className="mt-6 text-sm text-[var(--theme-muted)]">
            {hero.schoolsNote}{" "}
            <Link
              href={siteNav.schoolsHref}
              className="font-semibold text-[var(--theme-primary)] underline-offset-2 hover:underline"
            >
              {hero.schoolsLink}
            </Link>
            .
          </p>
        </Reveal>

        <Reveal delayMs={140}>
          <ArchImageFrame className="aspect-[4/3] w-full lg:aspect-[5/4]">
            <MarketingImage
              src={marketingImages.hero}
              alt={marketingImages.heroAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
            />
            <figcaption
              className="absolute bottom-5 left-5 right-5 z-10 rounded-[var(--theme-radius-lg)] border bg-[var(--theme-paper)]/93 p-4 backdrop-blur-sm"
              style={{ borderColor: "var(--theme-line)" }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-muted)]">
                {hero.imageCaptionTitle}
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-lg text-[var(--theme-ink)]">
                {hero.imageCaptionBody}
              </p>
            </figcaption>
          </ArchImageFrame>
        </Reveal>
      </div>

      <div
        className="border-t bg-[color-mix(in_srgb,var(--theme-surface)_72%,var(--theme-paper))]"
        style={{ borderColor: "var(--theme-line)" }}
      >
        <Reveal className="mx-auto flex w-full max-w-[var(--theme-content-max)] flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="mk-eyebrow text-[var(--theme-muted)] before:bg-[var(--theme-primary)]">
            {audienceStrip.label}
          </p>
          <ul className="flex flex-wrap gap-2">
            {audienceStrip.items.map((label) => (
              <li
                key={label}
                className="mk-card rounded-[var(--theme-radius-button)] px-4 py-2 text-xs font-semibold text-[var(--theme-muted)] shadow-none"
              >
                {label}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
