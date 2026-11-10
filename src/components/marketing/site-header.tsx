import { siteNav } from "@/lib/marketing/home-content";
import { primaryNav } from "@/lib/marketing/navigation";
import { BrandLogo } from "@/components/marketing/brand-logo";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { NavLink } from "@/components/marketing/nav-link";
import { ProgramsNavDropdown } from "@/components/marketing/programs-nav-dropdown";

export function SiteHeader() {
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
          aria-label="Main"
        >
          {primaryNav.map((item) =>
            item.href === "/programs" ? (
              <ProgramsNavDropdown key={item.href} />
            ) : (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          <a
            href={siteNav.phoneHref}
            className="mk-phone-pill mk-header-action order-first sm:order-none"
          >
            <span aria-hidden>☎</span>
            <span className="hidden sm:inline">{siteNav.phone}</span>
            <span className="sm:hidden">Call</span>
          </a>
          <NavLink
            href={siteNav.loginHref}
            className="font-semibold min-h-[2.375rem] items-center"
          >
            Login
          </NavLink>
          <MarketingButton href={siteNav.trialHref} size="sm">
            Try a free class
          </MarketingButton>
        </div>
      </div>
    </header>
  );
}
