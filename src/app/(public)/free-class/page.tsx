import { Reveal } from "@/components/marketing/reveal";
import { StaticDemoForm } from "@/components/marketing/static-demo-form";
import { getMarketingContent } from "@/lib/i18n/marketing";
import { getServerLocale } from "@/lib/i18n/locale.server";
import "@/app/(public)/auth-portal.css";

/** Uses `cookies()` for locale — not compatible with prerender / instant nav. */
export const instant = false;

export default async function FreeClassPage() {
  const locale = await getServerLocale();
  const m = getMarketingContent(locale);
  const freeClass = m.freeClass;

  return (
    <section
      data-auth-portal
      className="mk-page-hero-band border-b"
      style={{
        borderColor: "var(--theme-line)",
        borderWidth: "0 0 var(--theme-border-width)",
      }}
    >
      <div className="mx-auto grid w-full max-w-[var(--theme-content-max)] gap-10 px-5 pt-14 pb-8 sm:px-6 lg:grid-cols-2 lg:items-start lg:gap-12 lg:pt-16 lg:pb-8">
        <Reveal className="lg:pt-2">
          <p className="mk-eyebrow">{m.ui.freeClassEyebrow}</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--theme-ink)] sm:text-5xl">
            {freeClass.title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--theme-muted)]">
            {freeClass.intro}
          </p>
        </Reveal>

        <Reveal delayMs={80} className="w-full">
          <div className="auth-portal-card mx-auto w-full max-w-lg p-8 lg:mx-0 lg:max-w-none">
            <StaticDemoForm submitLabel={m.ui.freeClassSubmit} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
