import { TeacherApplicationsPanel } from "@/components/dashboard/manager/teacher-applications-panel";
import { listTeacherApplicationsQueue } from "@/server/actions/teacher-application";

export async function TeacherApplicationsQueueSection() {
  const queue = await listTeacherApplicationsQueue();
  return (
    <div className="mt-6">
      <TeacherApplicationsPanel initial={queue} />
    </div>
  );
}
