import { redirect } from "next/navigation";
import { AcceptStaffInvitePanel } from "@/components/dashboard/accept-staff-invite-panel";
import { getStaffInviteForAccept } from "@/server/actions/invitations";

export const instant = false;

export default async function AcceptStaffInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ inviteId?: string }>;
}) {
  const q = await searchParams;
  const inviteId = q.inviteId?.trim();
  if (!inviteId) {
    redirect("/dashboard");
  }

  const result = await getStaffInviteForAccept(inviteId);
  if (!result.ok) {
    return (
      <div className="dash-card mx-auto max-w-lg p-6 text-sm text-red-700">
        {result.error}
      </div>
    );
  }

  return (
    <AcceptStaffInvitePanel
      inviteId={result.invite.id}
      role={result.invite.role}
      email={result.invite.email}
    />
  );
}
