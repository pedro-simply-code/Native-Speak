import Link from "next/link";
import { Reveal } from "@/components/marketing/reveal";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { getPublicBlogPosts } from "@/lib/content/blog-merge";
import { getServerLocale } from "@/lib/i18n/locale.server";

export const instant = false;

export default async function BlogIndexPage() {
  const locale = await getServerLocale();
  const blogPosts = await getPublicBlogPosts(locale);

  return (
    <div className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
      <Reveal>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--theme-ink)]">
          Blog
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--theme-muted)]">
          Tips for families, teachers, and learners on the Native Speak journey.
        </p>
      </Reveal>
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post, index) => (
          <li key={post.slug}>
            <Reveal delayMs={index * 40}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <figure
                  className="relative aspect-[4/3] overflow-hidden border"
                  style={{
                    borderColor: "var(--theme-line)",
                    borderRadius: "var(--theme-radius-lg)",
                  }}
                >
                  <MarketingImage
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </figure>
                <p className="mt-3 text-xs text-[var(--theme-muted)]">
                  {post.date} · {post.readMinutes} min
                </p>
                <h2 className="mt-1 font-semibold text-[var(--theme-ink)] group-hover:text-[var(--theme-primary)]">
                  {post.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--theme-muted)]">
                  {post.excerpt}
                </p>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
