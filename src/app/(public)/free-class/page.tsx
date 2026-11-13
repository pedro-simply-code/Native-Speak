import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { StaticDemoForm } from "@/components/marketing/static-demo-form";
import { MarketingLocaleBoundary } from "@/components/i18n/marketing-locale-boundary";

export default function FreeClassPage() {
  return (
    <MarketingLocaleBoundary>
      {(m) => {
        const freeClass = m.freeClass;
        return (
          <>
            <PageHero
              eyebrow={m.ui.freeClassEyebrow}
              title={freeClass.title}
              description={freeClass.intro}
              image={freeClass.image}
              imageAlt={freeClass.imageAlt}
            />
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
                  <StaticDemoForm submitLabel={m.ui.freeClassSubmit} />
                </div>
              </Reveal>
            </section>
          </>
        );
      }}
    </MarketingLocaleBoundary>
  );
}
