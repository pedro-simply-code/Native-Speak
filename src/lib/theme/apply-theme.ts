import { applyAppearanceCssVars } from "@/lib/theme/appearance-css-vars";
import type { SiteAppearance } from "@/lib/theme/types";

export function applySiteAppearance(
  root: HTMLElement,
  appearance: SiteAppearance,
): void {
  applyAppearanceCssVars(root, appearance);
}
