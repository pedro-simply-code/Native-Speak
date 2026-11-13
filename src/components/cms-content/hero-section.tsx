"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArchImageFrame } from "@/components/marketing/arch-image-frame";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { Reveal } from "@/components/marketing/reveal";
import type { HeroData } from "@/lib/cms/content";
import { heroButtonsInDisplayOrder } from "@/lib/cms/content";
import { buildLinkRel, isExternalHref } from "@/lib/cms/link-options";
import { cn } from "@/lib/utils";

function HeroHeadline({
  headline,
  highlight,
}: {
  headline: string;
  highlight: string;
}) {
  const accent = highlight.trim();
  const index = accent ? headline.indexOf(accent) : -1;
  if (index === -1) return <>{headline}</>;
  return (
    <>
      {headline.slice(0, index)}
      <span className="text-[var(--theme-accent)]">{accent}</span>
      {headline.slice(index + accent.length)}
    </>
  );
}

function HeroAction({
  href,
  newTab,
  nofollow,
  variant,
  children,
}: {
  href: string;
  newTab: boolean;
  nofollow: boolean;
  variant: "primary" | "soft";
  children: ReactNode;
}) {
  const url = href.trim() || "#";
  if (variant === "primary") {
    return (
      <MarketingButton href={url} variant="primary">
        {children}
      </MarketingButton>
    );
  }
  const rel = buildLinkRel({ newTab, nofollow }) ?? undefined;
  if (isExternalHref(url)) {
    return (
      <a
        href={url}
        target={newTab ? "_blank" : undefined}
        rel={rel}
        className="mk-btn-glow inline-flex items-center justify-center rounded-[var(--theme-radius-button)] bg-[var(--theme-surface)] px-6 py-3 text-sm font-semibold text-[var(--theme-primary-deep)] border border-[var(--theme-line)]"
      >
        {children}
      </a>
    );
  }
  return (
    <MarketingButton href={url} variant="soft">
      {children}
    </MarketingButton>
  );
}

/**
 * Native Speak homepage hero — same structure as `marketing/hero-section`, CMS-driven.
 */
export function HeroSection({
  data,
  className,
}: {
  data: HeroData;
  className?: string;
}) {
  const stats = data.stats.filter(
    (stat) => stat.value.trim() || stat.label.trim(),
  );
  const buttonOrder = heroButtonsInDisplayOrder(data);
  const highlights = data.highlights.filter((item) => item.trim());
  const audienceItems = data.audienceItems.filter((item) => item.trim());

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b",
        className,
      )}
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
          {data.eyebrow ? <p className="mk-eyebrow">{data.eyebrow}</p> : null}
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--theme-ink)] sm:text-[3.25rem]">
            <HeroHeadline headline={data.headline} highlight={data.highlight} />
          </h1>
          {data.description ? (
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-[var(--theme-muted)]">
              {data.description}
            </p>
          ) : null}

          {highlights.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {highlights.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="motion-chip mk-card rounded-[var(--theme-radius-md)] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wide text-[var(--theme-primary-deep)] shadow-none"
                  style={{ animationDelay: `${100 + index * 65}ms` }}
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}

          {stats.length > 0 ? (
            <ul className="mt-8 grid grid-cols-3 gap-2 sm:max-w-md">
              {stats.map((stat) => (
                <li key={stat.label} className="mk-stat">
                  <p className="mk-stat__value">{stat.value}</p>
                  <p className="mk-stat__label">{stat.label}</p>
                </li>
              ))}
            </ul>
          ) : null}

          {buttonOrder.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {buttonOrder.map((slot) =>
                slot === "primary" ? (
                  <HeroAction
                    key="primary"
                    href={data.primaryHref}
                    newTab={data.primaryNewTab}
                    nofollow={data.primaryNofollow}
                    variant="primary"
                  >
                    {data.primaryLabel}
                  </HeroAction>
                ) : (
                  <HeroAction
                    key="secondary"
                    href={data.secondaryHref}
                    newTab={data.secondaryNewTab}
                    nofollow={data.secondaryNofollow}
                    variant="soft"
                  >
                    {data.secondaryLabel}
                  </HeroAction>
                ),
              )}
            </div>
          ) : null}

          {data.schoolsNote || data.schoolsLink ? (
            <p className="mt-6 text-sm text-[var(--theme-muted)]">
              {data.schoolsNote}{" "}
              {data.schoolsLink ? (
                <Link
                  href={data.schoolsHref || "/schools"}
                  className="font-semibold text-[var(--theme-primary)] underline-offset-2 hover:underline"
                >
                  {data.schoolsLink}
                </Link>
              ) : null}
              .
            </p>
          ) : null}
        </Reveal>

        {data.imageSrc ? (
          <Reveal delayMs={140}>
            <ArchImageFrame className="aspect-[4/3] w-full lg:aspect-[5/4]">
              <MarketingImage
                src={data.imageSrc}
                alt={data.imageAlt || ""}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
              />
              {data.imageCaptionTitle || data.imageCaptionBody ? (
                <figcaption
                  className="absolute bottom-5 left-5 right-5 z-10 rounded-[var(--theme-radius-lg)] border bg-[var(--theme-paper)]/93 p-4 backdrop-blur-sm"
                  style={{ borderColor: "var(--theme-line)" }}
                >
                  {data.imageCaptionTitle ? (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-muted)]">
                      {data.imageCaptionTitle}
                    </p>
                  ) : null}
                  {data.imageCaptionBody ? (
                    <p className="mt-1 font-[family-name:var(--font-display)] text-lg text-[var(--theme-ink)]">
                      {data.imageCaptionBody}
                    </p>
                  ) : null}
                </figcaption>
              ) : null}
            </ArchImageFrame>
          </Reveal>
        ) : null}
      </div>

      {audienceItems.length > 0 ? (
        <div
          className="border-t bg-[color-mix(in_srgb,var(--theme-surface)_72%,var(--theme-paper))]"
          style={{ borderColor: "var(--theme-line)" }}
        >
          <Reveal className="mx-auto flex w-full max-w-[var(--theme-content-max)] flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            {data.audienceLabel ? (
              <p className="mk-eyebrow text-[var(--theme-muted)] before:bg-[var(--theme-primary)]">
                {data.audienceLabel}
              </p>
            ) : null}
            <ul className="flex flex-wrap gap-2">
              {audienceItems.map((label) => (
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
      ) : null}
    </section>
  );
}
