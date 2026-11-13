"use client";

import { MarketingButton } from "@/components/marketing/marketing-button";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { useMarketingContent } from "@/lib/i18n/hooks/use-marketing-content";

export function ProgressSection() {
  const m = useMarketingContent();
  const { progressSection, operatingHours, youCanExpect, siteNav } = m;

  return (
    <section
      id="expectations"
      className="mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6"
    >
      <Reveal>
        <SectionHeading
          eyebrow={m.ui.progressEyebrow}
          title={progressSection.title}
          description={progressSection.subtitle}
        />
      </Reveal>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Reveal delayMs={60}>
          <InfoPanel
            title={operatingHours.title}
            className="bg-[var(--theme-surface)]"
          >
            <p className="text-sm font-medium text-[var(--theme-muted)]">
              {operatingHours.timezone}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[var(--theme-ink)]">
              {operatingHours.rows.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
          </InfoPanel>
        </Reveal>

        <Reveal delayMs={120}>
          <InfoPanel title={youCanExpect.title}>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {youCanExpect.items.map((item) => (
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
          </InfoPanel>
        </Reveal>
      </div>

      <Reveal
        delayMs={160}
        className="mk-card mk-card--lift mt-10 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center"
      >
        <p className="max-w-xl text-sm text-[var(--theme-muted)]">
          {m.ui.progressCtaBody}
        </p>
        <MarketingButton href={siteNav.trialHref}>
          {m.ui.progressCtaButton}
        </MarketingButton>
      </Reveal>
    </section>
  );
}

function InfoPanel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mk-card p-6 ${className}`}>
      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--theme-ink)]">
        {title}
      </h3>
      {children}
    </div>
  );
}
