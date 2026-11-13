import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { FamilyScheduleForm } from "@/components/dashboard/family/schedule-form";
import { SchedulingPolicyAcceptance } from "@/components/dashboard/family/scheduling-policy-acceptance";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { getFamilyCreditsSummary } from "@/server/actions/appointment-changes";
import {
  hasAcceptedFamilyPrivacyPolicy,
  hasAcceptedSchedulingPolicy,
} from "@/server/actions/policy-acceptance";
import { listActiveTeachers, listFamilyStudents } from "@/server/actions/family";

async function FamilyScheduleSection() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard/family/schedule");

  const [teachers, students, credits, needsScheduling, needsPrivacy] =
    await Promise.all([
      listActiveTeachers(),
      listFamilyStudents(),
      getFamilyCreditsSummary(),
      hasAcceptedSchedulingPolicy(session.user.id).then((v) => !v),
      hasAcceptedFamilyPrivacyPolicy(session.user.id).then((v) => !v),
    ]);

  return (
    <>
      <p className="mt-4 text-sm text-[var(--dash-muted)]">
        Class credits available: <strong>{credits.balance}</strong>
      </p>
      <div className="mt-4">
        <SchedulingPolicyAcceptance
          needsScheduling={needsScheduling}
          needsPrivacy={needsPrivacy}
        />
      </div>
      <div className="mt-6">
        <FamilyScheduleForm teachers={teachers} students={students} />
      </div>
    </>
  );
}

export default function FamilySchedulePage() {
  return (
    <>
      <DashboardPageHeader
        title="Schedule a class"
        description="Pick a teacher (or your preferred teacher), student, and time slot."
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading schedule…" />}
      >
        <FamilyScheduleSection />
      </Suspense>
    </>
  );
}
