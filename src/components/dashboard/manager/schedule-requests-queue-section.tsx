import { ScheduleRequestsPanel } from "@/components/dashboard/manager/schedule-requests-panel";
import { listPendingChangeRequests } from "@/server/actions/appointment-changes";

export async function ScheduleRequestsQueueSection() {
  const pending = await listPendingChangeRequests();
  return (
    <div className="mt-6">
      <ScheduleRequestsPanel initial={pending} />
    </div>
  );
}
