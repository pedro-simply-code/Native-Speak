"use client";

import type { ReactNode } from "react";
import { TestimonialsCarousel } from "@/components/testimonials-carousel";
import { TESTIMONIALS, type Testimonial } from "@/cms-seed-content/testimonials";
import type { ReviewsSectionData } from "@/lib/cms/homepage-sections";
import { resolveReviewsSectionDescription } from "@/lib/cms/reviews";
import { appSectionAltBand, appSectionContainer, siteReveal } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export function ReviewsSection({
  data,
  className,
  testimonials = TESTIMONIALS,
  fillLast = false,
  introOverride,
}: {
  data: ReviewsSectionData;
  className?: string;
  testimonials?: Testimonial[];
  fillLast?: boolean;
  /** Studio editor: inline-editable intro replaces the static copy block. */
  introOverride?: ReactNode;
}) {
  const hasQuotes = testimonials.length > 0;
  const eyebrow = hasQuotes ? data.eyebrow : data.emptyEyebrow;
  const headline = hasQuotes ? data.headline : data.emptyHeadline;
  const description = hasQuotes
    ? resolveReviewsSectionDescription(
        data.description,
        testimonials,
        fillLast,
      )
    : data.emptyDescription;

  return (
    <section id="reviews" className={cn(appSectionAltBand, className)}>
      <div className={appSectionContainer}>
        <div className={cn(siteReveal, "mb-14 max-w-2xl")}>
          {introOverride ?? (
            <>
              {eyebrow ? (
                <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                  {eyebrow}
                </p>
              ) : null}
              <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
                {headline}
              </h2>
              {description ? (
                <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
                  {description}
                </p>
              ) : null}
            </>
          )}
        </div>
        {hasQuotes ? (
          <TestimonialsCarousel
            testimonials={testimonials}
            fillLast={fillLast}
          />
        ) : null}
      </div>
    </section>
  );
}
