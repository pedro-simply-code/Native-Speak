import { freeClassContent } from "@/lib/marketing/pages-content";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { StaticDemoForm } from "@/components/marketing/static-demo-form";

export default function FreeClassPage() {
  return (
    <>
      <PageHero
        eyebrow="Free trial"
        title={freeClassContent.title}
        description={freeClassContent.intro}
        image={freeClassContent.image}
        imageAlt={freeClassContent.imageAlt}
      />
      <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
        <Reveal className="mx-auto max-w-lg">
          <div
            className="border p-8"
            style={{
              borderColor: "var(--theme-line)",
              borderRadius: "var(--theme-radius-xl)",
              boxShadow: "var(--theme-shadow-md)",
              background: "var(--theme-paper)",
            }}
          >
            <StaticDemoForm submitLabel="Request free class" />
          </div>
        </Reveal>
      </section>
    </>
  );
}
