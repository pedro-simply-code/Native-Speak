import { marketingImages } from "@/lib/marketing/images";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingPlanPicker } from "@/components/marketing/pricing-plan-picker";
import { Reveal } from "@/components/marketing/reveal";
import { MarketingLocaleBoundary } from "@/components/i18n/marketing-locale-boundary";

export default function PricingPage() {
  return (
    <MarketingLocaleBoundary>
      {(m) => {
        const { pricingTestimonialsSection } = m;
        return (
          <>
            <PageHero
              eyebrow={m.ui.pricingEyebrow}
              title={m.pricingPage.title}
              description={m.pricingPage.intro}
              image={marketingImages.books}
              imageAlt={marketingImages.booksAlt}
            />
            <section className="pb-14 pt-2 lg:pb-16">
              <PricingPlanPicker />
            </section>

            <section
              className="mk-section border-t"
              style={{ borderColor: "var(--theme-line)" }}
            >
              <div className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6">
                <Reveal>
                  <h2 className="max-w-3xl font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)] sm:text-3xl">
                    {pricingTestimonialsSection.title}
                  </h2>
                </Reveal>
                <ul className="mt-10 grid gap-5 md:grid-cols-3">
                  {pricingTestimonialsSection.items.map((item, index) => (
                    <li key={item.author}>
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
          </>
        );
      }}
    </MarketingLocaleBoundary>
  );
}
