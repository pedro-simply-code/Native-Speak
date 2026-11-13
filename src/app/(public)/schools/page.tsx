import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { MarketingLocaleBoundary } from "@/components/i18n/marketing-locale-boundary";

export default function SchoolsPage() {
  return (
    <MarketingLocaleBoundary>
      {(m) => {
        const schools = m.schools;
        return (
          <>
            <PageHero
              eyebrow={m.ui.schoolsEyebrow}
              title={schools.title}
              description={schools.intro}
              image={schools.image}
              imageAlt={schools.imageAlt}
            />
            <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
              <Reveal>
                <ul className="space-y-4">
                  {schools.bullets.map((item) => (
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
                  <MarketingButton href={m.siteNav.trialHref}>
                    {m.ui.schoolsCta}
                  </MarketingButton>
                </div>
              </Reveal>
            </section>
          </>
        );
      }}
    </MarketingLocaleBoundary>
  );
}
