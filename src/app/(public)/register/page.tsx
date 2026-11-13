import { Reveal } from "@/components/marketing/reveal";
import { RegisterFamilyForm } from "@/components/auth/register-family-form";
import { getMarketingContent } from "@/lib/i18n/marketing";
import { getServerLocale } from "@/lib/i18n/locale.server";
import { env } from "@/env.js";
import "@/app/(public)/auth-portal.css";

/** Uses `cookies()` for locale — not compatible with prerender / instant nav. */
export const instant = false;

export default async function RegisterPage() {
  const locale = await getServerLocale();
  const m = getMarketingContent(locale);
  const showGoogle = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
  );

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
        <Reveal>
          <p className="mk-eyebrow">{m.auth.registerEyebrow}</p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--theme-ink)] sm:text-5xl">
            {m.auth.registerTitle}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--theme-muted)]">
            {m.auth.registerDesc}
          </p>
        </Reveal>

        <Reveal delayMs={80} className="w-full">
          <div className="auth-portal-card mx-auto w-full max-w-md p-8 lg:mx-0 lg:max-w-none">
            <RegisterFamilyForm showGoogle={showGoogle} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
