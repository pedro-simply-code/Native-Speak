import Link from "next/link";
import { blogPosts } from "@/lib/marketing/pages-content";
import { PageHero } from "@/components/marketing/page-hero";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { Reveal } from "@/components/marketing/reveal";
import { marketingImages } from "@/lib/marketing/images";

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Learning notes from our team"
        description="Short guides we publish as we launch — parenting, study habits, and how live classes differ from apps."
        image={marketingImages.books}
        imageAlt={marketingImages.booksAlt}
      />
      <section className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
        <ul className="grid gap-8 md:grid-cols-3">
          {blogPosts.map((post, index) => (
            <li key={post.slug}>
              <Reveal delayMs={index * 70}>
                <article
                  className="group flex h-full flex-col overflow-hidden border transition-shadow duration-300 hover:shadow-[var(--theme-shadow-md)]"
                  style={{
                    borderColor: "var(--theme-line)",
                    borderRadius: "var(--theme-radius-lg)",
                    background: "var(--theme-paper)",
                  }}
                >
                  <figure className="relative aspect-[16/10]">
                    <MarketingImage
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                    />
                  </figure>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs text-[var(--theme-muted)]">
                      {post.date} · {post.readMinutes} min read
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--theme-ink)]">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors group-hover:text-[var(--theme-primary)]"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-2 flex-1 text-sm text-[var(--theme-muted)]">
                      {post.excerpt}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-4 text-sm font-semibold text-[var(--theme-primary)]"
                    >
                      Read article →
                    </Link>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
