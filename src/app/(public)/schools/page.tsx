import { schoolsContent } from "@/lib/marketing/pages-content";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { siteNav } from "@/lib/marketing/home-content";

export default function SchoolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Partnerships"
        title={schoolsContent.title}
        description={schoolsContent.intro}
        image={schoolsContent.image}
        imageAlt={schoolsContent.imageAlt}
      />
      <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
        <Reveal className="mx-auto max-w-3xl">
          <ul className="space-y-4">
            {schoolsContent.bullets.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-[var(--theme-radius-md)] border px-4 py-3 text-sm"
                style={{
                  borderColor: "var(--theme-line)",
                  background: "var(--theme-surface)",
                }}
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: "var(--theme-accent)" }}
                />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <MarketingButton href={siteNav.trialHref}>
              Schedule a partner call
            </MarketingButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
