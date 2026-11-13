import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FamilyOverview } from "@/components/dashboard/modernize/family-overview";
import { getFamilyProfile } from "@/server/actions/family";
import { getFamilyOverviewCharts } from "@/server/queries/overview-analytics";

export const instant = false;

export default async function FamilyHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/family");
  }

  const [profile, charts] = await Promise.all([
    getFamilyProfile(),
    getFamilyOverviewCharts(session.user.id),
  ]);

  return <FamilyOverview profile={profile} charts={charts} />;
}
