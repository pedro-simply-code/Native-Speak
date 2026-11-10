import {
  BORDER_WIDTH,
  BUTTON_RADIUS,
  CONTENT_MAX_WIDTH,
  FONT_SCALE,
  RADIUS_SCALE,
  SHADOW_SCALE,
} from "@/lib/theme/appearance-tokens";
import { THEME_PRESETS } from "@/lib/theme/presets";
import type { SiteAppearance } from "@/lib/theme/types";

/** CSS custom properties applied on `:root` / `<html>`. */
export function getAppearanceCssVars(
  appearance: SiteAppearance,
): Record<string, string> {
  const preset = THEME_PRESETS[appearance.presetId];
  const { colors } = preset;
  const radius = RADIUS_SCALE[appearance.radius];
  const shadow = SHADOW_SCALE[appearance.shadow];

  return {
    "--background": colors.paper,
    "--foreground": colors.ink,
    "--theme-paper": colors.paper,
    "--theme-surface": colors.surface,
    "--theme-ink": colors.ink,
    "--theme-muted": colors.muted,
    "--theme-primary": colors.primary,
    "--theme-primary-deep": colors.primaryDeep,
    "--theme-accent": colors.accent,
    "--theme-line": colors.line,
    "--theme-line-strong": colors.lineStrong,
    "--theme-border-width": BORDER_WIDTH[appearance.border],
    "--theme-radius-sm": radius.sm,
    "--theme-radius-md": radius.md,
    "--theme-radius-lg": radius.lg,
    "--theme-radius-xl": radius.xl,
    "--theme-radius-button": BUTTON_RADIUS[appearance.buttonShape],
    "--theme-shadow-sm": shadow.sm,
    "--theme-shadow-md": shadow.md,
    "--theme-shadow-float": shadow.float,
    "--theme-font-size": FONT_SCALE[appearance.fontScale],
    "--theme-content-max": CONTENT_MAX_WIDTH[appearance.contentWidth],
  };
}

export function applyAppearanceCssVars(
  root: HTMLElement,
  appearance: SiteAppearance,
): void {
  const vars = getAppearanceCssVars(appearance);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
  root.dataset.themePreset = appearance.presetId;
  root.dataset.themeRadius = appearance.radius;
  root.dataset.themeShadow = appearance.shadow;
}
