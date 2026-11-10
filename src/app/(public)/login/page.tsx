import { marketingImages } from "@/lib/marketing/images";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal } from "@/components/marketing/reveal";
import { StaticDemoForm } from "@/components/marketing/static-demo-form";

export default function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Student portal"
        title="Log in to your classes"
        description="Access schedules, teacher notes, and billing. Authentication will connect here later."
        image={marketingImages.conversation}
        imageAlt={marketingImages.conversationAlt}
      />
      <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
        <Reveal className="mx-auto max-w-md">
          <div
            className="border p-8"
            style={{
              borderColor: "var(--theme-line)",
              borderRadius: "var(--theme-radius-xl)",
              background: "var(--theme-paper)",
            }}
          >
            <StaticDemoForm submitLabel="Log in" showPassword />
          </div>
        </Reveal>
      </section>
    </>
  );
}
