/** Review moderation states stored in `reviews.status`. */
export type ReviewStatus = "pending" | "approved" | "hidden";

export function reviewStatusLabel(
  status: string,
  audience: "studio" | "portal" = "studio",
): string {
  if (audience === "portal") {
    switch (status) {
      case "pending":
        return "Under review";
      case "approved":
        return "Published";
      case "hidden":
        return "Not published";
      default:
        return status;
    }
  }

  switch (status) {
    case "pending":
      return "Pending approval";
    case "approved":
      return "Published";
    case "hidden":
      return "Hidden";
    default:
      return status;
  }
}

export type ReviewSource = "upwork" | "client" | "manual" | "google";

export function normalizeReviewSource(source: unknown): ReviewSource {
  if (
    source === "client" ||
    source === "manual" ||
    source === "google" ||
    source === "upwork"
  ) {
    return source;
  }
  return "manual";
}

export function reviewSourceLabel(source: string): string {
  switch (normalizeReviewSource(source)) {
    case "client":
      return "Client portal";
    case "upwork":
      return "Upwork";
    case "google":
      return "Google";
    case "manual":
      return "Manual";
    default:
      return source;
  }
}

/** Public site: bundled static testimonials omit `source` and are treated as Upwork. */
export function testimonialDisplaySource(source?: string): ReviewSource {
  if (
    source === "client" ||
    source === "manual" ||
    source === "google" ||
    source === "upwork"
  ) {
    return source;
  }
  return "upwork";
}

/** Public marketing carousel / testimonial cards. */
export function testimonialRatingScreenReader(
  rating: number,
  source?: string,
): string {
  const normalized = testimonialDisplaySource(source);
  if (normalized === "upwork") return `Rated ${rating} out of 5 on Upwork.`;
  if (normalized === "google") return `Rated ${rating} out of 5 on Google.`;
  return `Rated ${rating} out of 5.`;
}

export function testimonialRatingMeta(
  rating: number,
  period: string,
  source?: string,
): string {
  const normalized = testimonialDisplaySource(source);
  const score = rating.toFixed(2);
  if (normalized === "upwork") return `${score} on Upwork · ${period}`;
  if (normalized === "google") return `${score} on Google · ${period}`;
  return `${score} · ${period}`;
}

export function testimonialsIncludeUpwork(
  testimonials: { source?: string }[],
): boolean {
  return testimonials.some(
    (item) => testimonialDisplaySource(item.source) === "upwork",
  );
}

/** Default intro under “What Clients Say” when the CMS field is empty. */
export const STATIC_CLIENT_PROOF_INTRO =
  "Verified reviews from our founder's public Upwork profile — published as written. Client names stay private on Upwork.";

export function clientProofIntro(
  testimonials: { source?: string }[],
  staticFallback: boolean,
): string {
  if (staticFallback) {
    return STATIC_CLIENT_PROOF_INTRO;
  }

  const sources = new Set(
    testimonials.map((item) => testimonialDisplaySource(item.source)),
  );
  if (sources.size === 1 && sources.has("client")) {
    return "Feedback from clients on completed projects, submitted through our portal and published with their approval.";
  }
  if (sources.has("upwork") && !sources.has("client")) {
    return STATIC_CLIENT_PROOF_INTRO;
  }
  return "Published client feedback — from our portal and verified platforms where noted.";
}

export function resolveReviewsSectionDescription(
  description: string,
  testimonials: { source?: string }[],
  fillLast: boolean,
): string {
  const trimmed = description.trim();
  if (trimmed) return trimmed;
  return clientProofIntro(testimonials, fillLast);
}
