/** Shared raised surfaces, inputs, and controls (driven by site settings CSS variables). */

export const appPanel =
  "site-elevated site-radius-lg bg-sc-section text-sc-ink";

export const appPanelMuted =
  "site-elevated-muted site-radius-lg bg-sc-section-alt/90 text-sc-ink";

/** CMS / marketing hero band — follows `--site-bg-section-alt`. */
export const appHeroBand = "bg-sc-section-alt text-sc-ink";

/** Inner hero layout — matches homepage `max-w-[1400px]`. */
export const appHeroContainer = "mx-auto max-w-[1400px]";

export const appServicesBand =
  "bg-sc-section border-b border-[#15130f]/10 py-20 lg:py-24";

export const appServicesContainer = "mx-auto max-w-[1400px] px-6";

export const appSectionBand = "border-b border-[#15130f]/10 py-20 lg:py-24";

export const appSectionContainer = "mx-auto max-w-[1400px] px-6";

export const appSectionAltBand =
  "bg-sc-section border-b border-[#15130f]/10 py-20 lg:py-24";

export const appContactBand =
  "bg-sc-section scroll-mt-20 py-20 lg:py-24";

export const appCtaBand =
  "bg-sc-section border-t border-[#15130f]/10 py-20 lg:py-24";

export const appCtaContainer = "mx-auto max-w-[1400px] px-6";

/** Homepage scroll-reveal motion (requires `SiteMotionRoot` on public pages). */
export const siteReveal = "site-reveal";
export const siteStagger = "site-stagger";
export const siteMotionLift = "site-motion-lift";
export const siteCardMotion =
  "site-reveal site-motion-lift group site-card-hover-accent";

/** Quote blockquote element (inside `appQuotePageWrap` div). */
export const appQuoteOuter = "w-full border-0";

/** Page / editor shell around the blockquote. */
export const appQuotePageWrap = "mx-auto w-full max-w-[1400px] px-5 py-5";

/** Left accent bar + quote typography. */
export const appQuoteInner =
  "w-full border-l-2 border-sc-accent-bright pl-4 text-[17px] leading-relaxed text-[#57524a] italic";

export const appPanelHover = "site-elevated-hover";

/** Primary CTA (dark fill). Always use with size/layout classes or the presets below. */
export const appPrimaryButton =
  "site-radius-md bg-[#15130f] text-white transition-colors hover:bg-sc-accent";

export const appPrimaryButtonStudio =
  "inline-flex items-center justify-center site-radius-md bg-[#15130f] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase transition-colors hover:bg-sc-accent";

export const appOutlineButtonStudio =
  "inline-flex items-center justify-center gap-1.5 site-outline-cta site-radius-md bg-sc-section px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-sc-ink uppercase transition-colors hover:bg-sc-section-alt";

export const appPrimaryButtonStudioSm =
  "inline-flex items-center gap-1.5 site-radius-md bg-[#15130f] px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] text-white uppercase hover:bg-sc-accent";

export const appPrimaryButtonStudioSubmit =
  "inline-flex items-center justify-center site-radius-md bg-[#15130f] px-5 py-2.5 text-[10px] font-bold tracking-[0.16em] text-white uppercase hover:bg-sc-accent";

export const appPrimaryButtonMarketing =
  "inline-flex items-center gap-2 site-radius-md bg-[#15130f] px-6 py-3.5 text-[11px] font-bold tracking-[0.16em] text-white uppercase transition-colors hover:bg-sc-accent";

export const appPrimaryButtonMarketingLg =
  "inline-flex items-center gap-2 site-radius-md bg-[#15130f] px-8 py-4 text-[12px] font-bold tracking-[0.18em] text-white uppercase transition-colors hover:bg-sc-accent";

/** Filled accent CTA (uses palette bright + accent on hover). */
export const appAccentBrightButtonMarketing =
  "inline-flex items-center gap-2 site-radius-md bg-sc-accent-bright px-8 py-4 text-[12px] font-bold tracking-[0.18em] text-[#15130f] uppercase transition-colors hover:bg-sc-accent hover:text-white";

export const appAccentBrightButtonMarketingSm =
  "inline-flex items-center gap-2 site-radius-md bg-sc-accent-bright px-7 py-3.5 text-[12px] font-bold tracking-[0.16em] text-[#15130f] uppercase transition-colors hover:bg-sc-accent hover:text-white";

export const appGhostButton =
  "site-control site-radius-md bg-sc-section px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] uppercase text-sc-ink";

export const appGhostButtonLg =
  "site-control site-radius-md bg-sc-section px-3 py-2 text-[10px] font-bold tracking-[0.12em] uppercase text-sc-ink";

export const appAccentButtonLg =
  "inline-flex items-center site-radius-md bg-sc-accent px-3 py-2 text-[10px] font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-[#15130f]";

export const appOutlineButton =
  "site-outline-cta bg-sc-section px-6 py-3.5 text-[11px] font-bold tracking-[0.16em] text-sc-ink uppercase";

export const appIconButton =
  "site-control inline-flex items-center justify-center site-radius-md bg-sc-section text-sc-ink";

const appInputFocus =
  "focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--site-accent-focus)]";

export const appInput = `site-input-surface site-radius-md w-full border-0 bg-sc-section px-3 py-2 text-sm text-sc-ink ring-1 ring-[#15130f]/10 transition-[box-shadow,ring-color] placeholder:text-[#9a9488] ${appInputFocus} aria-[invalid=true]:ring-red-500/50`;

export const appInputLg = `site-input-surface site-radius-md w-full border-0 bg-sc-section px-4 py-3 text-sm text-sc-ink ring-1 ring-[#15130f]/10 transition-[box-shadow,ring-color] placeholder:text-[#6f6a60] ${appInputFocus} aria-[invalid=true]:ring-red-500/50`;

export const appInputOnMuted = `site-input-surface site-radius-md w-full border-0 bg-sc-section-alt px-3 py-2 text-sm text-sc-ink ring-1 ring-[#15130f]/10 transition-[box-shadow,ring-color] ${appInputFocus}`;

export const appChip =
  "site-control site-radius-md bg-sc-section px-2 py-1 text-[10px] font-bold tracking-[0.1em] uppercase text-sc-ink";

export const appChipMuted =
  "site-elevated-muted site-radius-md bg-[#f7f4ee] px-2 py-1 text-[10px] font-bold tracking-[0.1em] uppercase";

export const appTag =
  "site-control site-radius-md bg-white px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#57524a] uppercase";

export const appEmptyState =
  "site-radius-lg p-6 text-sm text-[#6f6a60] shadow-[inset_0_1px_2px_rgba(21,19,15,0.04)] ring-1 ring-dashed ring-[#15130f]/15";

export const appDropdown =
  "site-elevated site-radius-lg bg-white ring-1 ring-[#15130f]/5";

/** Unread count on bell, tabs, and project links — follows site palette accent. */
export const appNotificationCountBadge =
  "app-notification-badge inline-flex min-w-5 items-center justify-center rounded-full px-1 font-bold text-white";

export const appNotificationCountBadgeSm =
  "app-notification-badge inline-flex min-w-[1.125rem] items-center justify-center rounded-full px-1.5 text-[9px] font-bold text-white";

/** Highlight for unread notification rows (dropdown + notifications page). */
export const appNotificationUnreadRow =
  "app-notification-unread app-notification-unread-accent";

export const appShellAside = "site-shell-aside bg-sc-section-alt text-sc-ink";

export const appShellHeader =
  "site-shell-header border-b bg-sc-canvas/90 backdrop-blur-md";
