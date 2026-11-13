import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { MarketingLocaleBoundary } from "@/components/i18n/marketing-locale-boundary";

export default function AboutPage() {
  return (
    <MarketingLocaleBoundary>
      {(m) => {
        const about = m.about;
        return (
          <>
            <PageHero
              eyebrow={m.ui.aboutEyebrow}
              title={about.title}
              description={about.intro}
              image={about.image}
              imageAlt={about.imageAlt}
            />
            <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6 lg:py-16">
              <ul className="grid gap-5 md:grid-cols-3">
                {about.pillars.map((pillar, index) => (
                  <li key={pillar.title}>
                    <Reveal delayMs={index * 70}>
                      <article className="mk-card mk-card--lift h-full p-6">
                        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--theme-ink)]">
                          {pillar.title}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--theme-muted)]">
                          {pillar.body}
                        </p>
                      </article>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </section>
          </>
        );
      }}
    </MarketingLocaleBoundary>
  );
}
