import { marketingImages } from "@/lib/marketing/images";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { LoginForm } from "@/components/auth/login-form";
import { getMarketingContent } from "@/lib/i18n/marketing";
import { getServerLocale } from "@/lib/i18n/locale.server";
import { env } from "@/env.js";
import { auth } from "@/auth";
import "@/app/(public)/auth-portal.css";

/** Allow `searchParams` without blocking the marketing shell in Next 16. */
export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
    verified?: string;
  }>;
}) {
  const query = await searchParams;
  const locale = await getServerLocale();
  const m = getMarketingContent(locale);
  const showGoogle = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
  );
  const session = await auth();

  return (
    <>
      <PageHero
        eyebrow={m.auth.loginEyebrow}
        title={m.auth.loginTitle}
        description={m.auth.loginDesc}
        image={marketingImages.conversation}
        imageAlt={marketingImages.conversationAlt}
      />
      <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
        <Reveal className="mx-auto max-w-md">
          <div className="auth-portal-card p-8">
            <LoginForm
              showGoogle={showGoogle}
              callbackUrl={query.callbackUrl ?? null}
              authError={query.error ?? null}
              emailVerified={query.verified === "1"}
              activeSessionEmail={session?.user?.email ?? null}
            />
          </div>
        </Reveal>
      </section>
    </>
  );
}
