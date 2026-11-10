import type {
  BorderStyle,
  ButtonShape,
  ContentWidth,
  FontScale,
  RadiusStyle,
  ShadowStyle,
} from "@/lib/theme/types";

export const BORDER_WIDTH: Record<BorderStyle, string> = {
  thin: "1px",
  medium: "1.5px",
  thick: "2px",
};

export const RADIUS_SCALE: Record<
  RadiusStyle,
  { sm: string; md: string; lg: string; xl: string; button: string }
> = {
  sharp: { sm: "4px", md: "6px", lg: "8px", xl: "10px", button: "8px" },
  soft: { sm: "8px", md: "12px", lg: "16px", xl: "20px", button: "12px" },
  rounded: { sm: "10px", md: "14px", lg: "20px", xl: "28px", button: "999px" },
  editorial: { sm: "12px", md: "18px", lg: "26px", xl: "34px", button: "999px" },
};

export const SHADOW_SCALE: Record<
  ShadowStyle,
  { sm: string; md: string; float: string }
> = {
  none: {
    sm: "none",
    md: "none",
    float: "none",
  },
  soft: {
    sm: "0 2px 10px rgba(20, 30, 28, 0.06)",
    md: "0 22px 46px -26px rgba(34, 51, 46, 0.22)",
    float: "0 20px 50px -20px rgba(18, 74, 67, 0.22)",
  },
  elevated: {
    sm: "0 4px 14px rgba(20, 30, 28, 0.1)",
    md: "0 28px 56px -24px rgba(34, 51, 46, 0.35)",
    float: "0 32px 64px -28px rgba(18, 74, 67, 0.38)",
  },
};

export const FONT_SCALE: Record<FontScale, string> = {
  compact: "15px",
  default: "16px",
  comfortable: "17.5px",
};

export const CONTENT_MAX_WIDTH: Record<ContentWidth, string> = {
  narrow: "960px",
  default: "1200px",
  wide: "1400px",
};

export const BUTTON_RADIUS: Record<ButtonShape, string> = {
  pill: "999px",
  rounded: "12px",
};
