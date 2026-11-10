import { aboutContent } from "@/lib/marketing/pages-content";
import { marketingImages } from "@/lib/marketing/images";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { MarketingImage } from "@/components/marketing/marketing-image";

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title={aboutContent.title}
        description={aboutContent.intro}
        image={aboutContent.image}
        imageAlt={aboutContent.imageAlt}
      />
      <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <ul className="space-y-6">
              {aboutContent.pillars.map((pillar) => (
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
                src={marketingImages.laptop}
                alt={marketingImages.laptopAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
              />
            </figure>
          </Reveal>
        </div>
      </section>
    </>
  );
}
