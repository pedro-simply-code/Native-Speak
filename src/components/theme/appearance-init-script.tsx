import {
  BORDER_WIDTH,
  BUTTON_RADIUS,
  CONTENT_MAX_WIDTH,
  FONT_SCALE,
  RADIUS_SCALE,
  SHADOW_SCALE,
} from "@/lib/theme/appearance-tokens";
import { APPEARANCE_STORAGE_KEY, DEFAULT_APPEARANCE } from "@/lib/theme/constants";
import { THEME_PRESETS } from "@/lib/theme/presets";

const presetColors = Object.fromEntries(
  Object.entries(THEME_PRESETS).map(([id, preset]) => [id, preset.colors]),
);

const appearanceBootstrap = {
  storageKey: APPEARANCE_STORAGE_KEY,
  fallback: DEFAULT_APPEARANCE,
  presets: presetColors,
  borderWidth: BORDER_WIDTH,
  radiusScale: RADIUS_SCALE,
  shadowScale: SHADOW_SCALE,
  buttonRadius: BUTTON_RADIUS,
  fontScale: FONT_SCALE,
  contentMax: CONTENT_MAX_WIDTH,
};

/**
 * Keeps first paint aligned with localStorage when the SSR cookie is missing or stale.
 */
export function AppearanceInitScript() {
  const script = `
(function (cfg) {
  try {
    var raw = localStorage.getItem(cfg.storageKey);
    if (!raw) return;
    var data = JSON.parse(raw);
    if (!data || !cfg.presets[data.presetId]) return;
    var colors = cfg.presets[data.presetId];
    var radius = cfg.radiusScale[data.radius] || cfg.radiusScale[cfg.fallback.radius];
    var shadow = cfg.shadowScale[data.shadow] || cfg.shadowScale[cfg.fallback.shadow];
    var border = (cfg.borderWidth[data.border] || cfg.borderWidth[cfg.fallback.border]);
    var root = document.documentElement;
    var vars = {
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
      "--theme-border-width": border,
      "--theme-radius-sm": radius.sm,
      "--theme-radius-md": radius.md,
      "--theme-radius-lg": radius.lg,
      "--theme-radius-xl": radius.xl,
      "--theme-radius-button": cfg.buttonRadius[data.buttonShape] || cfg.buttonRadius[cfg.fallback.buttonShape],
      "--theme-shadow-sm": shadow.sm,
      "--theme-shadow-md": shadow.md,
      "--theme-shadow-float": shadow.float,
      "--theme-font-size": cfg.fontScale[data.fontScale] || cfg.fontScale[cfg.fallback.fontScale],
      "--theme-content-max": cfg.contentMax[data.contentWidth] || cfg.contentMax[cfg.fallback.contentWidth],
    };
    for (var k in vars) {
      if (Object.prototype.hasOwnProperty.call(vars, k)) {
        root.style.setProperty(k, vars[k]);
      }
    }
  } catch (e) {}
})(${JSON.stringify(appearanceBootstrap)});
`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
