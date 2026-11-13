import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { WorkCard } from "@/components/work-card";
import { WorkFilters } from "@/components/work-filters";
import type { Project } from "@/cms-seed-content/projects";
import type { WorkSectionData } from "@/lib/cms/homepage-sections";
import { appEmptyState, appSectionBand, appSectionContainer, siteReveal, siteStagger } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

function WorkSectionHeader({
  data,
  introOverride,
}: {
  data: WorkSectionData;
  introOverride?: ReactNode;
}) {
  if (introOverride) {
    return (
      <div className={cn(siteReveal, "mb-16 max-w-2xl")}>{introOverride}</div>
    );
  }

  return (
    <div className={cn(siteReveal, "mb-16 max-w-2xl")}>
      {data.eyebrow ? (
        <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
          {data.eyebrow}
        </p>
      ) : null}
      <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase whitespace-pre-line">
        {data.headline}
      </h2>
      {data.description ? (
        <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
          {data.description}
        </p>
      ) : null}
    </div>
  );
}

export function WorkSection({
  data,
  className,
  projects = [],
  introOverride,
  ctaSlot,
  emptyMessageOverride,
}: {
  data: WorkSectionData;
  className?: string;
  projects?: Project[];
  /** Studio: inline-editable intro replaces the static copy block. */
  introOverride?: ReactNode;
  /** Studio: editable CTA row instead of the public link. */
  ctaSlot?: ReactNode;
  emptyMessageOverride?: ReactNode;
}) {
  const isPortfolio = data.variant === "portfolio";
  const featured = projects.slice(0, data.projectCount);
  const sectionId = isPortfolio ? "portfolio" : "our-work";

  return (
    <section id={sectionId} className={cn(appSectionBand, className)}>
      <div className={appSectionContainer}>
        {/* Portfolio starts at the filter bar; the editable intro is featured-only. */}
        {isPortfolio ? null : (
          <WorkSectionHeader data={data} introOverride={introOverride} />
        )}

        {isPortfolio ? (
          projects.length > 0 ? (
            data.showTagFilter ? (
              <WorkFilters projects={projects} />
            ) : (
              <div
                className={cn(
                  siteStagger,
                  "grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3",
                )}
              >
                {projects.map((project) => (
                  <WorkCard key={project.slug} project={project} />
                ))}
              </div>
            )
          ) : (
            <p
              className={cn(
                appEmptyState,
                "bg-white/60 px-6 py-16 text-center text-[15px] text-[#57524a]",
              )}
            >
              {emptyMessageOverride ?? data.emptyMessage}
            </p>
          )
        ) : featured.length > 0 ? (
          <>
            <div
              className={cn(
                siteStagger,
                "grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {featured.map((project) => (
                <WorkCard key={project.slug} project={project} />
              ))}
            </div>
            {data.showCta && (ctaSlot ?? (data.ctaLabel.trim() ? (
              <div className="mt-12 text-center">
                <Link
                  href={data.ctaHref.trim() || "/work"}
                  target={data.ctaNewTab ? "_blank" : undefined}
                  rel={data.ctaNewTab ? "noreferrer noopener" : undefined}
                  className="hover:bg-sc-accent inline-flex items-center gap-2 rounded-md bg-[#15130f] px-8 py-4 text-[12px] font-bold tracking-[0.18em] text-white uppercase transition-colors"
                >
                  {data.ctaLabel} <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : null))}
          </>
        ) : (
          <p
            className={cn(
              appEmptyState,
              "bg-white/60 px-6 py-16 text-center text-[15px] text-[#57524a]",
            )}
          >
            {emptyMessageOverride ?? data.emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}
