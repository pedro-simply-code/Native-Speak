import { nanoid } from "nanoid";
import type { AppLocale } from "@/lib/i18n/config";
import { getMarketingContent } from "@/lib/i18n/marketing";
import {
  aboutContent,
  freeClassContent,
  schoolsContent,
} from "@/lib/marketing/pages-content";
import type { MarketingBlock } from "@/server/db/schema";
import type { MarketingPageKey } from "@/lib/marketing/page-keys";

function emptyLexicalParagraph(text: string): Record<string, unknown> {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text,
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

export function defaultBlocksForPage(
  pageKey: MarketingPageKey,
  locale: AppLocale = "en",
): MarketingBlock[] {
  const m = getMarketingContent(locale);

  switch (pageKey) {
    case "home":
      return [
        {
          id: nanoid(10),
          type: "hero",
          eyebrow: m.hero.eyebrow,
          title: m.hero.title,
          subtitle: m.hero.subtitle,
          highlights: [...m.hero.highlights],
          ctaLabel: m.hero.ctaPrimary,
          ctaHref: "/free-class",
        },
        {
          id: nanoid(10),
          type: "stats",
          items: [...m.heroStats],
        },
        {
          id: nanoid(10),
          type: "steps",
          eyebrow: m.howItWorksSection.eyebrow,
          title: m.howItWorksSection.title,
          subtitle: m.howItWorksSection.subtitle,
          steps: m.howItWorksSection.steps.map((s) => ({ ...s })),
        },
        {
          id: nanoid(10),
          type: "features",
          title: m.programsSection.title,
          subtitle: m.programsSection.subtitle,
          items: m.programLevels.map((p) => ({
            title: p.label,
            body: `Learn more about our ${p.label.toLowerCase()} track.`,
          })),
        },
      ];
    case "about":
      return [
        {
          id: nanoid(10),
          type: "richText",
          title: aboutContent.title,
          lexicalState: emptyLexicalParagraph(aboutContent.intro),
        },
        {
          id: nanoid(10),
          type: "features",
          title: "What we stand for",
          items: aboutContent.pillars.map((p) => ({ ...p })),
        },
        {
          id: nanoid(10),
          type: "image",
          url: aboutContent.image,
          alt: aboutContent.imageAlt,
        },
      ];
    case "schools":
      return [
        {
          id: nanoid(10),
          type: "richText",
          title: schoolsContent.title,
          lexicalState: emptyLexicalParagraph(schoolsContent.intro),
        },
        {
          id: nanoid(10),
          type: "bullets",
          title: "Pilot benefits",
          bullets: [...schoolsContent.bullets],
        },
        {
          id: nanoid(10),
          type: "image",
          url: schoolsContent.image,
          alt: schoolsContent.imageAlt,
        },
      ];
    case "free-class":
      return [
        {
          id: nanoid(10),
          type: "richText",
          title: freeClassContent.title,
          lexicalState: emptyLexicalParagraph(freeClassContent.intro),
        },
        {
          id: nanoid(10),
          type: "image",
          url: freeClassContent.image,
          alt: freeClassContent.imageAlt,
        },
        {
          id: nanoid(10),
          type: "cta",
          title: "Ready?",
          body: "Book your intro session — no card required.",
          buttonLabel: "Try a free class",
          buttonHref: "/register",
        },
      ];
    case "pricing":
      return [
        {
          id: nanoid(10),
          type: "richText",
          title: "Pricing",
          lexicalState: emptyLexicalParagraph(
            "Transparent packages for families. Live site still uses static pricing cards until you publish block layouts.",
          ),
        },
      ];
    case "how-it-works":
      return [
        {
          id: nanoid(10),
          type: "steps",
          eyebrow: m.howItWorksSection.eyebrow,
          title: m.howItWorksSection.title,
          subtitle: m.howItWorksSection.subtitle,
          steps: m.howItWorksSection.steps.map((s) => ({ ...s })),
        },
      ];
    case "programs":
      return [
        {
          id: nanoid(10),
          type: "features",
          title: m.programsSection.title,
          subtitle: m.programsSection.subtitle,
          items: m.programLevels.map((p) => ({
            title: p.label,
            body: `Program track: ${p.label}.`,
          })),
        },
      ];
    default:
      return [];
  }
}
