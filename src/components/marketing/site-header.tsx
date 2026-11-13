"use client";

import { BrandLogo } from "@/components/marketing/brand-logo";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { NavLink } from "@/components/marketing/nav-link";
import { ProgramsNavDropdown } from "@/components/marketing/programs-nav-dropdown";
import { AppLanguageMenu } from "@/components/i18n/app-language-menu";
import { useMarketingContent } from "@/lib/i18n/hooks/use-marketing-content";

export function SiteHeader() {
  const m = useMarketingContent();

  return (
    <header
      className="sticky top-0 z-40 border-b bg-[color-mix(in_srgb,var(--theme-paper)_94%,transparent)] backdrop-blur-md motion-header"
      style={{
        borderColor: "var(--theme-line)",
        borderWidth: "0 0 var(--theme-border-width)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[var(--theme-content-max)] flex-col gap-3 px-5 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:gap-6">
        <BrandLogo />

        <nav
          className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5 lg:justify-center"
          aria-label={m.ui.mainNavAria}
        >
          {m.primaryNav.map((item) =>
            item.href === "/programs" ? (
              <ProgramsNavDropdown key={item.href} />
            ) : (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 lg:shrink-0">
          <AppLanguageMenu variant="marketing" />
          <NavLink
            href={m.siteNav.loginHref}
            className="font-semibold min-h-[2.375rem] items-center"
          >
            {m.ui.login}
          </NavLink>
          <MarketingButton href={m.siteNav.trialHref} size="sm">
            {m.ui.tryFreeClass}
          </MarketingButton>
        </div>
      </div>
    </header>
  );
}
