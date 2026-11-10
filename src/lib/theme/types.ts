/** Color-based preset ids (not tied to marketing template folder names). */
export const THEME_PRESET_IDS = [
  "harvest-teal",
  "cobalt-mist",
  "sandstone-pine",
  "parchment-lime",
  "midnight-coral",
  "sage-apricot",
  "terracotta-gold",
  "navy-ember",
  "lagoon-honey",
  "sky-sprout",
] as const;

export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];

export const BORDER_STYLES = ["thin", "medium", "thick"] as const;
export type BorderStyle = (typeof BORDER_STYLES)[number];

export const RADIUS_STYLES = ["sharp", "soft", "rounded", "editorial"] as const;
export type RadiusStyle = (typeof RADIUS_STYLES)[number];

export const SHADOW_STYLES = ["none", "soft", "elevated"] as const;
export type ShadowStyle = (typeof SHADOW_STYLES)[number];

export const FONT_SCALES = ["compact", "default", "comfortable"] as const;
export type FontScale = (typeof FONT_SCALES)[number];

export const CONTENT_WIDTHS = ["narrow", "default", "wide"] as const;
export type ContentWidth = (typeof CONTENT_WIDTHS)[number];

export const BUTTON_SHAPES = ["pill", "rounded"] as const;
export type ButtonShape = (typeof BUTTON_SHAPES)[number];

export type ThemeColors = {
  paper: string;
  surface: string;
  ink: string;
  muted: string;
  primary: string;
  primaryDeep: string;
  accent: string;
  line: string;
  lineStrong: string;
};

export type ThemePreset = {
  id: ThemePresetId;
  /** Human label derived from the palette (shown in admin). */
  label: string;
  description: string;
  colors: ThemeColors;
  swatches: [string, string, string, string];
};

export type SiteAppearance = {
  presetId: ThemePresetId;
  border: BorderStyle;
  radius: RadiusStyle;
  shadow: ShadowStyle;
  fontScale: FontScale;
  contentWidth: ContentWidth;
  buttonShape: ButtonShape;
};
