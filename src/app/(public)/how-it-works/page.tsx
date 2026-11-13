import Link from "next/link";
import { marketingImages } from "@/lib/marketing/images";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { ThreeColumnCards } from "@/components/marketing/three-column-cards";
import { MarketingLocaleBoundary } from "@/components/i18n/marketing-locale-boundary";

export default function HowItWorksPage() {
  return (
    <MarketingLocaleBoundary>
      {(m) => (
        <>
          <PageHero
            eyebrow={m.ui.processEyebrow}
            title={m.howItWorksPage.title}
            description={m.howItWorksPage.intro}
            image={marketingImages.conversation}
            imageAlt={marketingImages.conversationAlt}
          />

          <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6 lg:-mt-4">
            <ol className="grid gap-5 md:grid-cols-3">
              {m.howItWorksOnboarding.map((step, index) => (
                <li key={step.title}>
                  <Reveal delayMs={index * 60}>
                    <article
                      className="mk-card mk-card--lift h-full border-t-[3px] p-6"
                      style={{ borderTopColor: "var(--theme-accent)" }}
                    >
                      <p
                        className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wide text-[var(--theme-accent)]"
                        aria-hidden
                      >
                        {m.ui.stepLabel.replace("{n}", String(index + 1))}
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

          <ThreeColumnCards
            title={m.classIncludesSection.title}
            items={m.classIncludesSection.items}
          />

          <ThreeColumnCards
            title={m.proveProgressSection.title}
            items={m.proveProgressSection.items}
            className="border-t border-[var(--theme-line)]"
          />

          <section className="mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6">
            <Reveal>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)] sm:text-3xl">
                {m.teacherHiring.title}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--theme-muted)]">
                {m.teacherHiring.intro}
              </p>
              <ul className="mt-6 space-y-3">
                {m.teacherHiring.bullets.map((bullet) => (
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

          <section
            id="faq"
            className="mk-section border-t mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6"
            style={{ borderColor: "var(--theme-line)" }}
          >
            <Reveal>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)] sm:text-3xl">
                {m.ui.faqTitle}
              </h2>
              <p className="mt-2 text-sm text-[var(--theme-muted)]">
                {m.ui.faqIntroBefore}{" "}
                <Link
                  href="/pricing"
                  className="font-semibold text-[var(--theme-primary)]"
                >
                  {m.ui.faqIntroLink}
                </Link>
                {m.ui.faqIntroAfter}
              </p>
            </Reveal>
            <div className="mk-card mt-8 p-5 sm:p-6">
              <FaqAccordion items={m.howItWorksFaq} />
            </div>
          </section>

          <section className="mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 pb-16 sm:px-6">
            <Reveal className="mk-footer-cta flex flex-col items-start justify-between gap-4 p-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)]">
                  {m.ui.howItWorksCtaTitle}
                </h2>
                <p className="mt-2 text-sm text-[var(--theme-muted)]">
                  {m.ui.howItWorksCtaBody}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <MarketingButton href={m.siteNav.trialHref}>
                  {m.ui.tryFreeClass}
                </MarketingButton>
                <MarketingButton href="/pricing" variant="soft">
                  {m.ui.viewPricing}
                </MarketingButton>
              </div>
            </Reveal>
          </section>
        </>
      )}
    </MarketingLocaleBoundary>
  );
}
