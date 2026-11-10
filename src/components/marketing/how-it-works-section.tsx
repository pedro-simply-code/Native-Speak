import Link from "next/link";
import { howItWorksSection } from "@/lib/marketing/home-content";
import { ArchImageFrame } from "@/components/marketing/arch-image-frame";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";

export function HowItWorksSection() {
  return (
    <section
      className="mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6"
      id="how-it-works"
    >
      <Reveal>
        <SectionHeading
          eyebrow={howItWorksSection.eyebrow}
          title={howItWorksSection.title}
          description={howItWorksSection.subtitle}
        />
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {howItWorksSection.steps.map((item, index) => (
            <li key={item.step}>
              <Reveal delayMs={index * 70}>
                <article className="mk-card mk-card--lift flex h-full gap-4 p-5">
                  <p
                    className="font-[family-name:var(--font-display)] text-2xl font-semibold tabular-nums text-[var(--theme-accent)]"
                    aria-hidden
                  >
                    {item.step}
                  </p>
                  <div className="min-w-0">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--theme-ink)]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--theme-muted)]">
                      {item.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal delayMs={120} className="lg:sticky lg:top-28">
          <ArchImageFrame className="aspect-[4/3] w-full">
            <MarketingImage
              src={howItWorksSection.image}
              alt={howItWorksSection.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
            />
          </ArchImageFrame>
        </Reveal>
      </div>

      <p className="mt-8 text-sm font-medium">
        <Link
          href="/how-it-works"
          className="text-[var(--theme-primary)] underline-offset-2 hover:underline"
        >
          Read the full process, class structure &amp; FAQ →
        </Link>
      </p>
    </section>
  );
}
