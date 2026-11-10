import {
  APPEARANCE_COOKIE_KEY,
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
} from "@/lib/theme/constants";
import { THEME_PRESET_IDS } from "@/lib/theme/types";
import type { SiteAppearance } from "@/lib/theme/types";
import {
  BORDER_STYLES,
  BUTTON_SHAPES,
  CONTENT_WIDTHS,
  FONT_SCALES,
  RADIUS_STYLES,
  SHADOW_STYLES,
} from "@/lib/theme/types";

function isEnumValue<T extends string>(
  values: readonly T[],
  value: unknown,
): value is T {
  return typeof value === "string" && (values as readonly string[]).includes(value);
}

export function parseStoredAppearance(raw: string | null): SiteAppearance {
  if (!raw) {
    return DEFAULT_APPEARANCE;
  }
  try {
    const data = JSON.parse(raw) as Partial<SiteAppearance>;
    return {
      presetId: isEnumValue(THEME_PRESET_IDS, data.presetId)
        ? data.presetId
        : DEFAULT_APPEARANCE.presetId,
      border: isEnumValue(BORDER_STYLES, data.border)
        ? data.border
        : DEFAULT_APPEARANCE.border,
      radius: isEnumValue(RADIUS_STYLES, data.radius)
        ? data.radius
        : DEFAULT_APPEARANCE.radius,
      shadow: isEnumValue(SHADOW_STYLES, data.shadow)
        ? data.shadow
        : DEFAULT_APPEARANCE.shadow,
      fontScale: isEnumValue(FONT_SCALES, data.fontScale)
        ? data.fontScale
        : DEFAULT_APPEARANCE.fontScale,
      contentWidth: isEnumValue(CONTENT_WIDTHS, data.contentWidth)
        ? data.contentWidth
        : DEFAULT_APPEARANCE.contentWidth,
      buttonShape: isEnumValue(BUTTON_SHAPES, data.buttonShape)
        ? data.buttonShape
        : DEFAULT_APPEARANCE.buttonShape,
    };
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function loadAppearanceFromStorage(): SiteAppearance {
  if (typeof window === "undefined") {
    return DEFAULT_APPEARANCE;
  }
  return parseStoredAppearance(localStorage.getItem(APPEARANCE_STORAGE_KEY));
}

export function saveAppearanceToStorage(appearance: SiteAppearance): void {
  const json = JSON.stringify(appearance);
  localStorage.setItem(APPEARANCE_STORAGE_KEY, json);
  persistAppearanceCookie(json);
}

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function persistAppearanceCookie(json: string): void {
  if (typeof document === "undefined") {
    return;
  }
  const encoded = encodeURIComponent(json);
  document.cookie = `${APPEARANCE_COOKIE_KEY}=${encoded}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}
