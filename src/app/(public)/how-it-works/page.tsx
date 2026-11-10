import Link from "next/link";
import { marketingImages } from "@/lib/marketing/images";
import {
  classIncludesSection,
  howItWorksFaq,
  howItWorksOnboarding,
  howItWorksPage,
  proveProgressSection,
  teacherHiring,
} from "@/lib/marketing/how-it-works-content";
import { siteNav } from "@/lib/marketing/home-content";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { ThreeColumnCards } from "@/components/marketing/three-column-cards";

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="Process"
        title={howItWorksPage.title}
        description={howItWorksPage.intro}
        image={marketingImages.conversation}
        imageAlt={marketingImages.conversationAlt}
      />

      <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6 lg:-mt-4">
        <ol className="grid gap-5 md:grid-cols-3">
          {howItWorksOnboarding.map((step, index) => (
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
                    Step {index + 1}
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

      <ThreeColumnCards title={classIncludesSection.title} items={classIncludesSection.items} />

      <ThreeColumnCards
        title={proveProgressSection.title}
        items={proveProgressSection.items}
        className="border-t border-[var(--theme-line)]"
      />

      <section className="mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)] sm:text-3xl">
            {teacherHiring.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--theme-muted)]">
            {teacherHiring.intro}
          </p>
          <ul className="mt-6 space-y-3">
            {teacherHiring.bullets.map((bullet) => (
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
            Frequently asked questions
          </h2>
          <p className="mt-2 text-sm text-[var(--theme-muted)]">
            Choosing packages or credit? See also{" "}
            <Link href="/pricing" className="font-semibold text-[var(--theme-primary)]">
              pricing
            </Link>
            .
          </p>
        </Reveal>
        <div className="mk-card mt-8 p-5 sm:p-6">
          <FaqAccordion items={howItWorksFaq} />
        </div>
      </section>

      <section className="mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 pb-16 sm:px-6">
        <Reveal className="mk-footer-cta flex flex-col items-start justify-between gap-4 p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)]">
              What are you waiting for?
            </h2>
            <p className="mt-2 text-sm text-[var(--theme-muted)]">
              Start with a free class or browse packages on the pricing page.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <MarketingButton href={siteNav.trialHref}>Try a free class</MarketingButton>
            <MarketingButton href="/pricing" variant="soft">
              View pricing
            </MarketingButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
