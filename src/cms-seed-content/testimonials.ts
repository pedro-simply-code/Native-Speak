import type { ReviewSource } from "@/lib/cms/reviews";

export type Testimonial = {
  quote: string;
  /** Public project title from Upwork — client names stay private on the platform. */
  project: string;
  /** Engagement period shown on the public profile. */
  period: string;
  rating: number;
  /** Optional link to the matching case study. */
  projectSlug?: string;
  /** Omitted on bundled static reviews (treated as Upwork). */
  source?: ReviewSource;
};

export const UPWORK_PROFILE_URL =
  "https://www.upwork.com/freelancers/~013a005b07aa150e48";

/**
 * Real client feedback from our founder's public Upwork profile.
 * Quotes are verbatim. Where Upwork truncates a review in the public view,
 * only the complete sentences are quoted — no words are added or reworded.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Ryan is superb at what he does. A real pleasure to work with such a professional.",
    project: "OC WordPress Site",
    period: "Jun 2021 – Aug 2023",
    rating: 5,
  },
  {
    quote:
      "A great partner for WordPress projects. Would definitely work with Ryan again in the future.",
    project: "WordPress Content Migration",
    period: "Mar 2022 – Sep 2022",
    rating: 5,
  },
  {
    quote:
      "Ryan was quick to grasp my needs and clearly explained how to address and remedy them. The job was completed quickly.",
    project: "Update my custom WordPress site to current PHP",
    period: "Feb 2021",
    rating: 5,
  },
  {
    quote:
      "Ryan consistently delivered great work while building two separate sites. He has excellent front-end development skills and a close attention to detail.",
    project: "Front-end developer",
    period: "Sep 2019 – Feb 2021",
    rating: 5,
  },
];
