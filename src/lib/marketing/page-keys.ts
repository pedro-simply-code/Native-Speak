export const MARKETING_PAGE_KEYS = [
  "home",
  "about",
  "pricing",
  "how-it-works",
  "schools",
  "free-class",
  "programs",
] as const;

export type MarketingPageKey = (typeof MARKETING_PAGE_KEYS)[number];

export const MARKETING_PAGE_LABELS: Record<MarketingPageKey, string> = {
  home: "Home",
  about: "About",
  pricing: "Pricing",
  "how-it-works": "How it works",
  schools: "Schools",
  "free-class": "Free class",
  programs: "Programs index",
};
