import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Database,
  Globe,
  Palette,
  Users,
} from "lucide-react";
import type { ServicesSectionData } from "@/lib/cms/homepage-sections";
import {
  getAgencyPartnershipService,
  resolveServicesSectionCards,
} from "@/lib/cms/services-section-cards";
import {
  appPanelHover,
  appPanelMuted,
  appServicesBand,
  appServicesContainer,
  siteCardMotion,
  siteMotionLift,
  siteReveal,
  siteStagger,
} from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  palette: Palette,
  database: Database,
  globe: Globe,
  users: Users,
};

function ServiceCard({
  card,
}: {
  card: ReturnType<typeof resolveServicesSectionCards>[number];
}) {
  const Icon = ICONS[card.icon] ?? Palette;

  return (
    <div
      className={cn(
        appPanelMuted,
        appPanelHover,
        siteCardMotion,
        "p-8",
      )}
    >
      <div className="group-hover:bg-sc-accent-bright mb-6 flex size-14 items-center justify-center bg-[#15130f] text-white transition-colors group-hover:text-[#15130f]">
        <Icon className="size-6" />
      </div>
      <h3 className="text-lg font-black tracking-tight uppercase">
        {card.title}
      </h3>
      <p className="mt-3 text-[14px] leading-relaxed text-[#57524a]">
        {card.summary}
      </p>
      {card.tools.length > 0 ? (
        <ul className="mt-5 space-y-1.5 text-[10px] font-bold tracking-[0.1em] text-[#6f6a60] uppercase">
          {card.tools.map((tool) => (
            <li key={tool.label}>
              {tool.href ? (
                <a
                  href={tool.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-sc-accent underline-offset-2 transition-colors hover:underline"
                >
                  {tool.label}
                </a>
              ) : (
                <span>{tool.label}</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {card.href ? (
        <Link
          href={card.href}
          className="hover:text-sc-accent mt-5 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-[#15130f] uppercase underline underline-offset-4 transition-colors"
        >
          Learn more <ArrowUpRight className="size-3" />
        </Link>
      ) : null}
    </div>
  );
}

export function ServicesAgencySpotlight({
  className,
}: {
  className?: string;
}) {
  const agency = getAgencyPartnershipService();
  if (!agency) return null;

  return (
    <div
      className={cn(
        siteReveal,
        siteMotionLift,
        "mt-6 flex flex-col gap-6 rounded-lg bg-[#15130f] p-8 text-white shadow-[0_8px_32px_rgba(21,19,15,0.2)] lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-5">
        <div className="bg-sc-accent-bright flex size-12 shrink-0 items-center justify-center text-[#15130f]">
          <Users className="size-5" />
        </div>
        <div>
          <p className="text-sc-accent-bright text-[10px] font-bold tracking-[0.2em] uppercase">
            For agencies
          </p>
          <h3 className="mt-2 text-lg font-black tracking-tight uppercase">
            {agency.title}
          </h3>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/70">
            {agency.summary}
          </p>
        </div>
      </div>
      <Link
        href={`/services#${agency.slug}`}
        className="hover:border-sc-accent-bright hover:text-sc-accent-bright inline-flex shrink-0 items-center gap-2 self-start border-b-2 border-white/30 pb-1 text-[10px] font-bold tracking-[0.16em] uppercase transition-colors lg:self-auto"
      >
        Explore partnership <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}

export function ServicesSection({
  data,
  className,
  introOverride,
  cardsSlot,
}: {
  data: ServicesSectionData;
  className?: string;
  introOverride?: ReactNode;
  /** Studio editor: custom card grid (e.g. editable previews). */
  cardsSlot?: ReactNode;
}) {
  const cards = resolveServicesSectionCards(data);
  const gridClass =
    data.columns === 2
      ? "grid gap-6 sm:grid-cols-2"
      : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="services"
      className={cn(appServicesBand, className)}
    >
      <div className={appServicesContainer}>
        <div className={cn(siteReveal, "mb-16 max-w-2xl")}>
          {introOverride ?? (
            <>
              {data.eyebrow ? (
                <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
                  {data.eyebrow}
                </p>
              ) : null}
              <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
                {data.headline}
              </h2>
              {data.description ? (
                <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
                  {data.description}
                </p>
              ) : null}
            </>
          )}
        </div>

        {cardsSlot ??
          (cards.length > 0 ? (
            <div className={cn(siteStagger, gridClass)}>
              {cards.map((card, index) => (
                <ServiceCard key={`${card.title}-${index}`} card={card} />
              ))}
            </div>
          ) : null)}

        {data.showAgencySpotlight ? <ServicesAgencySpotlight /> : null}
      </div>
    </section>
  );
}
