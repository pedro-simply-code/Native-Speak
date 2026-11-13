import { PageHero } from "@/components/marketing/page-hero";
import type { PageHeaderSectionData } from "@/lib/cms/site-page-sections";

/** Inner-page band — matches `marketing/page-hero`. */
export function PageHeaderSection({ data }: { data: PageHeaderSectionData }) {
  const title = data.headline.replace(/\n/g, " ").trim();
  return (
    <PageHero
      eyebrow={data.eyebrow || undefined}
      title={title}
      description={data.description}
      image={data.image}
      imageAlt={data.imageAlt}
    />
  );
}
