import type { ReactNode } from "react";
import type { LegalDocumentSectionData } from "@/lib/cms/site-page-sections";

export function LegalDocumentSection({
  data,
  bodyOverride,
}: {
  data: LegalDocumentSectionData;
  bodyOverride?: ReactNode;
}) {
  if (bodyOverride) {
    return (
      <section className="bg-sc-section-alt py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-6">{bodyOverride}</div>
      </section>
    );
  }

  return (
    <section className="bg-sc-section-alt py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6">
        {data.eyebrow.trim() ? (
          <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
            {data.eyebrow}
          </p>
        ) : null}
        <h1 className="mt-5 text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02] font-black tracking-[-0.04em] uppercase">
          {data.headline}
        </h1>
        {data.lastUpdated.trim() ? (
          <p className="mt-4 text-[13px] tracking-[0.08em] text-[#6f6a60] uppercase">
            Last updated: {data.lastUpdated}
          </p>
        ) : null}

        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-[#57524a]">
          {data.sections.map((section, index) => (
            <section key={`${index}-${section.title.slice(0, 20)}`}>
              <h2 className="text-lg font-black tracking-tight text-[#15130f] uppercase">
                {section.title}
              </h2>
              <p className="mt-3 whitespace-pre-wrap">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
