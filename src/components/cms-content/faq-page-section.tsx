import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { SITE } from "@/cms-seed-content/site";
import type { FaqSectionData } from "@/lib/cms/site-page-sections";

function EmailNote({ note }: { note: string }) {
  const trimmed = note.trim();
  if (!trimmed) return null;
  const email = SITE.email;
  if (trimmed.includes(email)) {
    const [before, after] = trimmed.split(email);
    return (
      <p className="mt-4 text-[13px] text-[#6f6a60]">
        {before}
        <a
          href={`mailto:${email}`}
          className="hover:text-sc-accent underline underline-offset-4"
        >
          {email}
        </a>
        {after}
      </p>
    );
  }
  return <p className="mt-4 text-[13px] text-[#6f6a60]">{trimmed}</p>;
}

export function FaqPageSection({
  data,
  introOverride,
  itemsOverride,
}: {
  data: FaqSectionData;
  introOverride?: ReactNode;
  itemsOverride?: ReactNode;
}) {
  const headlineLines = data.headline.split("\n");

  return (
    <section className="bg-sc-section-alt border-b border-[#15130f]/10 py-16 lg:py-24">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          {introOverride ?? (
            <>
              {data.eyebrow.trim() ? (
                <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                  {data.eyebrow}
                </p>
              ) : null}
              <h1 className="mt-5 text-[clamp(2.4rem,5.2vw,4.4rem)] leading-[0.98] font-black tracking-[-0.045em] uppercase">
                {headlineLines.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {index > 0 ? <br /> : null}
                    {line}
                  </span>
                ))}
              </h1>
              {data.description.trim() ? (
                <p className="mt-6 max-w-md text-[16px] leading-relaxed text-[#57524a]">
                  {data.description}
                </p>
              ) : null}
              {data.ctaLabel.trim() ? (
                <Link
                  href={data.ctaHref.trim() || "/contact"}
                  className="hover:bg-sc-accent mt-8 inline-flex items-center gap-2 rounded-md bg-[#15130f] px-6 py-3.5 text-[11px] font-bold tracking-[0.16em] text-white uppercase transition-colors"
                >
                  {data.ctaLabel} <ArrowRight className="size-4" />
                </Link>
              ) : null}
              <EmailNote note={data.emailNote} />
            </>
          )}
        </div>

        {itemsOverride ?? (
          <div className="divide-y divide-[#15130f]/12 border-y border-[#15130f]/12">
            {data.items.map((item, index) => (
              <details
                key={`${index}-${item.question.slice(0, 24)}`}
                className="group py-5"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left [&::-webkit-details-marker]:hidden">
                  <span className="text-[17px] leading-snug font-bold tracking-tight">
                    {item.question}
                  </span>
                  <Plus className="text-sc-accent mt-0.5 size-5 shrink-0 transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <p className="mt-3 max-w-2xl pr-8 text-[15px] leading-relaxed whitespace-pre-wrap text-[#57524a]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
