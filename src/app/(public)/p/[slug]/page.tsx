import { notFound } from "next/navigation";
import { Reveal } from "@/components/marketing/reveal";
import { CmsPublicDocument } from "@/components/cms-content/cms-public-document";
import { parseContentDocument } from "@/lib/cms/content";
import { markdownToElements } from "@/lib/content/render-markdown";
import { getServerLocale } from "@/lib/i18n/locale.server";
import { getPublishedPage } from "@/server/queries/cms";

type Props = { params: Promise<{ slug: string }> };

export const instant = false;

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const page = await getPublishedPage(slug, locale);
  if (!page) notFound();

  const blockDoc = parseContentDocument(page.bodyLexical);
  if (blockDoc) {
    return <CmsPublicDocument bodyLexical={page.bodyLexical} />;
  }

  const elements = markdownToElements(page.bodyMarkdown);

  return (
    <article className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
      <Reveal>
        <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--theme-ink)]">
          {page.title}
        </h1>
        {page.excerpt ? (
          <p className="mt-3 max-w-2xl text-lg text-[var(--theme-muted)]">
            {page.excerpt}
          </p>
        ) : null}
      </Reveal>
      <Reveal delayMs={80} className="mx-auto mt-10 max-w-3xl space-y-4">
        {elements.map((el) =>
          el.kind === "h2" ? (
            <h2
              key={el.text}
              className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--theme-ink)]"
            >
              {el.text}
            </h2>
          ) : (
            <p
              key={el.text}
              className="text-base leading-relaxed text-[var(--theme-muted)]"
            >
              {el.text}
            </p>
          ),
        )}
      </Reveal>
    </article>
  );
}
