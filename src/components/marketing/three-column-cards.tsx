import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";

type Card = { title: string; body: string };

export function ThreeColumnCards({
  eyebrow,
  title,
  items,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  items: readonly Card[];
  className?: string;
}) {
  return (
    <section className={`mk-section mx-auto w-full max-w-[var(--theme-content-max)] px-5 sm:px-6 ${className}`}>
      <Reveal>
        <SectionHeading eyebrow={eyebrow} title={title} />
      </Reveal>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.title}>
            <Reveal delayMs={index * 70}>
              <article className="mk-card mk-card--lift h-full p-6">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--theme-ink)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--theme-muted)]">
                  {item.body}
                </p>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
