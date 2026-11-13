import { marketingImages } from "@/lib/marketing/images";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { RegisterFamilyForm } from "@/components/auth/register-family-form";
import { MarketingLocaleBoundary } from "@/components/i18n/marketing-locale-boundary";
import { env } from "@/env.js";
import "@/app/(public)/auth-portal.css";

export default function RegisterPage() {
  const showGoogle = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <MarketingLocaleBoundary>
      {(m) => (
        <>
          <PageHero
            eyebrow={m.auth.registerEyebrow}
            title={m.auth.registerTitle}
            description={m.auth.registerDesc}
            image={marketingImages.conversation}
            imageAlt={marketingImages.conversationAlt}
          />
          <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
            <Reveal className="mx-auto max-w-md">
              <div className="auth-portal-card p-8">
                <RegisterFamilyForm showGoogle={showGoogle} />
              </div>
            </Reveal>
          </section>
        </>
      )}
    </MarketingLocaleBoundary>
  );
}
