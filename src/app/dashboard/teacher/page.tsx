import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TeacherOverview } from "@/components/dashboard/modernize/teacher-overview";
import { TeacherPayoutsCard } from "@/components/dashboard/teacher/teacher-payouts-card";
import { getTeacherProfile } from "@/server/actions/teacher";
import { getTeacherOverviewCharts } from "@/server/queries/overview-analytics";

export const instant = false;

export default async function TeacherHomePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/teacher");
  }

  const [profile, charts] = await Promise.all([
    getTeacherProfile(),
    getTeacherOverviewCharts(session.user.id),
  ]);

  return (
    <>
      <TeacherOverview profile={profile} charts={charts} />
      <div className="mt-6">
        <TeacherPayoutsCard />
      </div>
    </>
  );
}
