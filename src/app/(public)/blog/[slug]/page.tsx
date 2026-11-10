import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/marketing/pages-content";
import { MarketingImage } from "@/components/marketing/marketing-image";
import { Reveal } from "@/components/marketing/reveal";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((entry) => entry.slug === slug);
  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-[var(--theme-content-max)] px-5 py-14 sm:px-6">
      <Reveal>
        <Link
          href="/blog"
          className="text-sm font-semibold text-[var(--theme-muted)] hover:text-[var(--theme-primary)]"
        >
          ← Back to blog
        </Link>
        <p className="mt-6 text-xs text-[var(--theme-muted)]">
          {post.date} · {post.readMinutes} min read
        </p>
        <h1 className="mt-2 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold text-[var(--theme-ink)]">
          {post.title}
        </h1>
      </Reveal>
      <Reveal delayMs={80} className="mt-8">
        <figure
          className="relative aspect-[21/9] overflow-hidden border"
          style={{
            borderColor: "var(--theme-line)",
            borderRadius: "var(--theme-radius-xl)",
          }}
        >
          <MarketingImage
            src={post.image}
            alt={post.imageAlt}
            fill
            sizes="100vw"
            priority
          />
        </figure>
      </Reveal>
      <Reveal delayMs={120} className="mx-auto mt-10 max-w-3xl space-y-4">
        {post.body.map((paragraph) => (
          <p
            key={paragraph}
            className="text-base leading-relaxed text-[var(--theme-muted)]"
          >
            {paragraph}
          </p>
        ))}
      </Reveal>
    </article>
  );
}
