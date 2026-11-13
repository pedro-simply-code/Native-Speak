import {
  CircleDollarSign,
  FileText,
  GraduationCap,
  Grid3X3,
  Heading,
  Heading2,
  Heading3,
  HelpCircle,
  Home,
  Layers,
  ListChecks,
  ListOrdered,
  Mail,
  MessageSquareQuote,
  Newspaper,
  Quote,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { InsertContentBlockId } from "@/components/cms-lexical/insert-content-block-types";

export type ContentBlockCategory =
  | "home"
  | "pages"
  | "programs"
  | "pricing"
  | "blog"
  | "text";

export type ContentBlockDefinition = {
  id: InsertContentBlockId;
  label: string;
  description: string;
  category: ContentBlockCategory;
  icon: LucideIcon;
};

/** One block per marketing section used on public routes. */
export const CONTENT_BLOCK_CATALOG: ContentBlockDefinition[] = [
  { id: "hero", label: "Home hero", description: "Homepage hero", category: "home", icon: Sparkles },
  { id: "steps", label: "How it works (home)", description: "Steps + side image", category: "home", icon: ListOrdered },
  { id: "programs-showcase", label: "Programs tabs", description: "Home programs switcher", category: "home", icon: Layers },
  { id: "progress", label: "Expectations", description: "Hours + what to expect", category: "home", icon: ListChecks },
  { id: "cta", label: "CTA card", description: "Single CTA band", category: "pages", icon: MessageSquareQuote },
  { id: "page-header", label: "Page hero", description: "Inner page title band", category: "pages", icon: FileText },
  { id: "page-intro", label: "Story + pillars", description: "About-style intro", category: "pages", icon: Users },
  { id: "onboarding-trio", label: "Onboarding cards", description: "How it works — 3 steps", category: "pages", icon: Home },
  { id: "feature-grid", label: "Three columns", description: "Class includes / benefits", category: "pages", icon: Grid3X3 },
  { id: "bullet-list", label: "Bullet list", description: "Teacher hiring / list", category: "pages", icon: ListChecks },
  { id: "faq", label: "FAQ", description: "Accordion questions", category: "pages", icon: HelpCircle },
  { id: "dual-cta", label: "Dual CTA", description: "Two buttons footer", category: "pages", icon: MessageSquareQuote },
  { id: "bullet-cta", label: "School bullets", description: "Bullets + CTA", category: "pages", icon: GraduationCap },
  { id: "lead-form", label: "Free class form", description: "Demo request form", category: "pages", icon: Mail },
  { id: "programs-grid", label: "Programs grid", description: "All programs cards", category: "programs", icon: Grid3X3 },
  { id: "program-detail", label: "Program detail", description: "Program body + chips", category: "programs", icon: GraduationCap },
  { id: "pricing-picker", label: "Pricing picker", description: "Interactive pricing UI", category: "pricing", icon: CircleDollarSign },
  { id: "testimonials", label: "Testimonials", description: "Quote cards", category: "pricing", icon: Quote },
  { id: "blog-header", label: "Blog header", description: "Blog index title", category: "blog", icon: Newspaper },
  { id: "blog", label: "Blog posts", description: "Published posts grid", category: "blog", icon: Newspaper },
  { id: "paragraph", label: "Paragraph", description: "Body text", category: "text", icon: FileText },
  { id: "h1", label: "Heading 1", description: "Page title", category: "text", icon: Heading },
  { id: "h2", label: "Heading 2", description: "Section heading", category: "text", icon: Heading2 },
  { id: "h3", label: "Heading 3", description: "Subheading", category: "text", icon: Heading3 },
  { id: "quote", label: "Quote", description: "Pull quote", category: "text", icon: Quote },
];

export const CONTENT_BLOCK_CATEGORIES: {
  id: ContentBlockCategory;
  label: string;
}[] = [
  { id: "home", label: "Home" },
  { id: "pages", label: "Pages" },
  { id: "programs", label: "Programs" },
  { id: "pricing", label: "Pricing" },
  { id: "blog", label: "Blog" },
  { id: "text", label: "Text" },
];
