import { SERVICES } from "@/cms-seed-content/services";
import type {
  ServicesSectionCard,
  ServicesSectionData,
} from "@/lib/cms/homepage-sections";

const SITE_CARD_ICONS: ServicesSectionCard["icon"][] = [
  "palette",
  "database",
  "globe",
  "users",
];

export function getAgencyPartnershipService() {
  return SERVICES.find((service) => service.slug === "agency-partnerships");
}

export function resolveServicesSectionCards(
  data: ServicesSectionData,
): ServicesSectionCard[] {
  if (data.cardSource === "custom") {
    return data.customCards.filter(
      (card) => card.title.trim() || card.summary.trim(),
    );
  }

  return SERVICES.filter((service) => service.slug !== "agency-partnerships")
    .slice(0, 3)
    .map((service, index) => ({
      title: service.title,
      summary: service.summary,
      href: `/services#${service.slug}`,
      tools: service.tools.map((tool) => ({
        label: tool.label,
        ...(tool.href ? { href: tool.href } : {}),
      })),
      icon: SITE_CARD_ICONS[index] ?? "palette",
    }));
}

export const SERVICES_CARD_ICON_OPTIONS: {
  value: ServicesSectionCard["icon"];
  label: string;
}[] = [
  { value: "palette", label: "Design" },
  { value: "database", label: "Platform" },
  { value: "globe", label: "Web" },
  { value: "users", label: "Agency" },
];

export const DEFAULT_CUSTOM_SERVICE_CARD: ServicesSectionCard = {
  title: "Custom service",
  summary: "Describe this offering.",
  href: "/services",
  tools: [],
  icon: "palette",
};
