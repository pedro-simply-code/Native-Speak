import { TeamGrid } from "@/components/team-grid";
import type { TeamMember } from "@/cms-seed-content/team";
import type { TeamSectionData } from "@/lib/cms/site-page-sections";
import {
  appPanelMuted,
  appSectionBand,
  appSectionContainer,
  siteReveal,
} from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

function renderMultiline(text: string) {
  return text.split("\n").map((line, index) => (
    <span key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}

export function TeamSection({
  data,
  members,
  teamFromStudio = false,
}: {
  data: TeamSectionData;
  members: TeamMember[];
  teamFromStudio?: boolean;
}) {
  return (
    <section
      id={data.anchorId || "team"}
      className={cn(
        appSectionBand,
        "scroll-mt-20 border-b border-[#15130f]/10 py-16 lg:py-24",
        data.surface === "alt" ? "bg-sc-section-alt" : "bg-sc-section",
      )}
    >
      <div className={appSectionContainer}>
        <div className={cn(siteReveal, "mb-14 max-w-2xl")}>
          <p className="text-sc-accent text-[11px] font-bold tracking-[0.24em] uppercase">
            {data.eyebrow}
          </p>
          <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] font-black tracking-[-0.035em] uppercase">
            {renderMultiline(data.headline)}
          </h2>
          <p className="mt-6 text-[16px] leading-relaxed text-[#57524a]">
            {data.description}
          </p>
        </div>

        {members.length > 0 ? (
          <TeamGrid members={members} />
        ) : (
          <p
            className={cn(
              appPanelMuted,
              "px-6 py-12 text-center text-sm text-[#6f6a60]",
            )}
          >
            {teamFromStudio
              ? "No studio team members yet. Add people in Studio → Team."
              : "Team profiles are temporarily unavailable."}
          </p>
        )}
      </div>
    </section>
  );
}

export function teamSectionFallbackMembers(): TeamMember[] {
  return [];
}
