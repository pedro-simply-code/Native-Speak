import Link from "next/link";
import { programs, programLevels } from "@/lib/marketing/home-content";
import { marketingImages } from "@/lib/marketing/images";
import { programIdToSlug } from "@/lib/marketing/navigation";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Programs"
        title="Spanish classes tailored to every stage"
        description="From preschool immersion games to high school credit and school partnerships — each track uses live instruction with native teachers."
        image={marketingImages.classroom}
        imageAlt={marketingImages.classroomAlt}
      />
      <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6 lg:py-16">
        <ul className="grid gap-6 md:grid-cols-2">
          {programLevels.map((level, index) => {
            const detail = programs[level.id];
            const slug = programIdToSlug[level.id];
            return (
              <li key={level.id}>
                <Reveal delayMs={index * 70}>
                  <Link
                    href={`/programs/${slug}`}
                    className="mk-card mk-card--lift group grid overflow-hidden md:grid-cols-[1.1fr_1fr]"
                    style={{ borderRadius: "var(--theme-radius-lg)" }}
                  >
                    <div className="p-6">
                      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)]">
                        {detail.title}
                      </h2>
                      {detail.meta ? (
                        <p className="mt-2 text-sm text-[var(--theme-accent)]">
                          {detail.meta}
                        </p>
                      ) : null}
                      <p className="mt-3 line-clamp-3 text-sm text-[var(--theme-muted)]">
                        {detail.body}
                      </p>
                      <span className="mt-4 inline-block text-sm font-semibold text-[var(--theme-primary)]">
                        Learn more →
                      </span>
                    </div>
                    <figure className="relative min-h-[180px]">
                      <MarketingImage
                        src={marketingImages.programs[level.id]}
                        alt={detail.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 320px"
                      />
                    </figure>
                  </Link>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
