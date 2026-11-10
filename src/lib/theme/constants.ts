import type { SiteAppearance } from "@/lib/theme/types";

export const APPEARANCE_STORAGE_KEY = "native-speak-site-appearance";

/** Mirror of appearance JSON for SSR (readable on server via `cookies()`). */
export const APPEARANCE_COOKIE_KEY = "native-speak-site-appearance";

export const DEFAULT_APPEARANCE: SiteAppearance = {
  presetId: "harvest-teal",
  border: "medium",
  radius: "editorial",
  shadow: "soft",
  fontScale: "default",
  contentWidth: "default",
  buttonShape: "pill",
};
