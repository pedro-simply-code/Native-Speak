import Link from "next/link";
import { footer, siteNav } from "@/lib/marketing/home-content";
import { BrandLogo } from "@/components/marketing/brand-logo";

export function SiteFooter() {
  return (
    <footer
      className="mt-auto border-t"
      style={{
        borderColor: "var(--theme-line)",
        borderWidth: "var(--theme-border-width) 0 0",
        background: "var(--theme-surface)",
      }}
    >
      <div className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <BrandLogo />
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--theme-muted)]">
              {footer.tagline}
            </p>
            <a
              href={siteNav.phoneHref}
              className="mk-phone-pill mt-4"
            >
              {siteNav.phone}
            </a>
          </div>
          {footer.columns.map((column) => (
            <div key={column.title}>
              <p className="mk-eyebrow text-[var(--theme-muted)] before:bg-[var(--theme-primary)]">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-[var(--theme-ink)] transition-colors hover:text-[var(--theme-primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p
          className="mt-10 border-t pt-6 text-xs text-[var(--theme-muted)]"
          style={{ borderColor: "var(--theme-line)" }}
        >
          © {footer.brand}. Early-stage academy — no fabricated reviews. Photos
          from Unsplash and Pixabay.
        </p>
      </div>
    </footer>
  );
}
