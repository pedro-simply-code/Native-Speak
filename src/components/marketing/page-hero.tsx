import { ArchImageFrame } from "@/components/marketing/arch-image-frame";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { Reveal } from "@/components/marketing/reveal";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
}: PageHeroProps) {
  return (
    <section
      className="mk-page-hero-band border-b"
      style={{
        borderColor: "var(--theme-line)",
        borderWidth: "0 0 var(--theme-border-width)",
      }}
    >
      <div className="mx-auto grid w-full max-w-[var(--theme-content-max)] gap-10 px-5 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
        <Reveal>
          {eyebrow ? <p className="mk-eyebrow">{eyebrow}</p> : null}
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--theme-ink)] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--theme-muted)]">
            {description}
          </p>
        </Reveal>
        {image && imageAlt ? (
          <Reveal delayMs={120}>
            <ArchImageFrame
              className="aspect-[4/3] w-full"
              variant="rounded"
            >
              <MarketingImage
                src={image}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
              />
            </ArchImageFrame>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
