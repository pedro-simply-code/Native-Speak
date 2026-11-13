import Link from "next/link";
import { notFound } from "next/navigation";
import { programs } from "@/lib/marketing/home-content";
import { marketingImages } from "@/lib/marketing/images";
import {
  programSlugs,
  slugToProgramId,
  type ProgramSlug,
} from "@/lib/marketing/navigation";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { siteNav } from "@/lib/marketing/home-content";

type ProgramPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return programSlugs.map((slug) => ({ slug }));
}

export default async function ProgramDetailPage({ params }: ProgramPageProps) {
  const { slug } = await params;
  if (!programSlugs.includes(slug as ProgramSlug)) {
    notFound();
  }
  const programId = slugToProgramId[slug as ProgramSlug];
  const detail = programs[programId];
  const image = marketingImages.programs[programId];

  return (
    <>
      <PageHero
        eyebrow="Program"
        title={detail.title}
        description={detail.body}
        image={image}
        imageAlt={`${detail.title} program`}
      />
      <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-12 sm:px-6">
        <Reveal>
          {detail.meta ? (
            <p className="text-sm font-semibold text-[var(--theme-accent)]">
              {detail.meta}
            </p>
          ) : null}
          <p className="mt-4 text-base leading-relaxed text-[var(--theme-muted)]">
            {detail.body}
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Live video classes",
              "Native Spanish teachers",
              "Homework optional",
              "Flexible rescheduling",
            ].map((item) => (
              <li
                key={item}
                className="rounded-[var(--theme-radius-md)] border px-4 py-3 text-sm"
                style={{
                  borderColor: "var(--theme-line)",
                  background: "var(--theme-surface)",
                }}
              >
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <MarketingButton href={siteNav.trialHref}>
              Book a free class
            </MarketingButton>
            <MarketingButton href="/pricing" variant="soft">
              View pricing
            </MarketingButton>
            <Link
              href="/programs"
              className="inline-flex items-center px-4 text-sm font-semibold text-[var(--theme-muted)] hover:text-[var(--theme-primary)]"
            >
              ← All programs
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
