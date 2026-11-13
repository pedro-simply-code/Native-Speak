import Link from "next/link";
import { createElement } from "react";
import {
  ArrowRight,
  Briefcase,
  Check,
  Code2,
  Database,
  FileText,
  Globe,
  Handshake,
  Layers,
  LayoutGrid,
  Palette,
  PenTool,
  Rocket,
  ShoppingCart,
  Sparkles,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { buildLinkRel, isExternalHref } from "@/lib/cms/link-options";
import type {
  ServiceOffering,
  ServiceOfferingsSectionData,
} from "@/lib/cms/site-page-sections";
import {
  appGhostButton,
  appPanel,
  siteMotionLift,
  siteReveal,
} from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

export const SERVICE_ICON_OPTIONS: {
  key: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "palette", label: "Palette", icon: Palette },
  { key: "code", label: "Code", icon: Code2 },
  { key: "pen-tool", label: "Pen tool", icon: PenTool },
  { key: "handshake", label: "Handshake", icon: Handshake },
  { key: "sparkles", label: "Sparkles", icon: Sparkles },
  { key: "layers", label: "Layers", icon: Layers },
  { key: "layout", label: "Layout", icon: LayoutGrid },
  { key: "database", label: "Database", icon: Database },
  { key: "globe", label: "Globe", icon: Globe },
  { key: "rocket", label: "Rocket", icon: Rocket },
  { key: "shopping-cart", label: "Shopping cart", icon: ShoppingCart },
  { key: "briefcase", label: "Briefcase", icon: Briefcase },
  { key: "wrench", label: "Wrench", icon: Wrench },
  { key: "zap", label: "Zap", icon: Zap },
  { key: "users", label: "Users", icon: Users },
  { key: "file-text", label: "File text", icon: FileText },
];

export function serviceOfferingIcon(key: string): LucideIcon {
  return (
    SERVICE_ICON_OPTIONS.find((option) => option.key === key)?.icon ?? Sparkles
  );
}

const serviceButtonClass =
  "hover:bg-sc-accent mt-8 inline-flex items-center gap-2 rounded-md bg-[#15130f] px-6 py-3 text-[11px] font-bold tracking-[0.16em] text-white uppercase transition-colors";

function ServiceButton({ service }: { service: ServiceOffering }) {
  const href = service.buttonHref.trim() || "/contact";
  const rel =
    buildLinkRel({
      newTab: service.buttonNewTab,
      nofollow: service.buttonNofollow,
    }) ?? undefined;
  const target = service.buttonNewTab ? "_blank" : undefined;
  const content = (
    <>
      {service.buttonLabel.trim() || "Discuss this service"}{" "}
      <ArrowRight className="size-4" />
    </>
  );

  if (isExternalHref(href)) {
    return (
      <a href={href} className={serviceButtonClass} target={target} rel={rel}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={serviceButtonClass} target={target} rel={rel}>
      {content}
    </Link>
  );
}

/**
 * Single detailed service used on `/services`: one anchored block per service
 * (description, deliverables, tools).
 */
export function ServiceOfferingsSection({
  data,
}: {
  data: ServiceOfferingsSectionData;
}) {
  const { service } = data;
  const anchor = service.slug.trim() || "service";

  return (
    <section
      id={anchor}
      className="scroll-mt-24 border-b border-[#15130f]/10 bg-white py-16 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className={siteReveal}>
          <div className="flex items-center gap-4">
            <span className="text-sc-accent-bright flex size-12 items-center justify-center bg-[#15130f]">
              {createElement(serviceOfferingIcon(service.icon), {
                className: "size-5",
              })}
            </span>
            <span className="text-[11px] font-bold tracking-[0.22em] text-[#6f6a60] uppercase">
              {service.number.trim() || "01"}
              {service.label.trim() ? ` / ${service.label}` : null}
            </span>
          </div>

          <h2 className="mt-6 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
            {service.title}
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed whitespace-pre-wrap text-[#57524a]">
            {service.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {service.tools.map((tool, toolIndex) =>
              tool.href ? (
                <a
                  key={`${tool.label}-${toolIndex}`}
                  href={tool.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    appGhostButton,
                    "hover:text-sc-accent transition-colors",
                  )}
                >
                  {tool.label}
                </a>
              ) : (
                <span
                  key={`${tool.label}-${toolIndex}`}
                  className={appGhostButton}
                >
                  {tool.label}
                </span>
              ),
            )}
          </div>
        </div>

        <div className={cn(appPanel, siteReveal, siteMotionLift, "p-8")}>
          <p className="text-sc-accent text-[11px] font-bold tracking-[0.2em] uppercase">
            {service.deliverablesTitle.trim() || "What you get"}
          </p>
          <ul className="mt-5 space-y-3.5">
            {service.deliverables.map((item, itemIndex) => (
              <li
                key={`${item}-${itemIndex}`}
                className="flex items-start gap-3"
              >
                <Check className="text-sc-accent mt-0.5 size-4 shrink-0" />
                <span className="text-[15px] leading-relaxed text-[#57524a]">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <ServiceButton service={service} />
        </div>
      </div>
    </section>
  );
}
