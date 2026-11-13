import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { MarketingImage } from "@/components/marketing/marketing-image";
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
              <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
                <Reveal>
                  <ul className="space-y-6">
                    {about.pillars.map((pillar) => (
                      <li key={pillar.title}>
                        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--theme-ink)]">
                          {pillar.title}
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--theme-muted)]">
                          {pillar.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal delayMs={100}>
                  <figure
                    className="group relative aspect-[4/3] overflow-hidden border"
                    style={{
                      borderColor: "var(--theme-line)",
                      borderRadius: "var(--theme-radius-xl)",
                      boxShadow: "var(--theme-shadow-md)",
                    }}
                  >
                    <MarketingImage
                      src={about.image}
                      alt={about.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 520px"
                      className="motion-program-image"
                    />
                  </figure>
                </Reveal>
              </div>
            </section>
          </>
        );
      }}
    </MarketingLocaleBoundary>
  );
}
