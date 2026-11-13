import { notFound } from "next/navigation";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { StudyWorkbookPanel } from "@/components/dashboard/family/study-workbook-panel";
import { getStudyWorkbookWithProgress } from "@/server/actions/study-workbooks";

type Props = { params: Promise<{ id: string }> };

export default async function FamilyStudyWorkbookPage({ params }: Props) {
  const { id } = await params;
  const data = await getStudyWorkbookWithProgress(id);
  if (!data) notFound();

  return (
    <>
      <DashboardPageHeader
        title={data.workbook.title}
        description="Notes and practice from your teacher"
      />
      <div className="mt-6">
        <StudyWorkbookPanel
          workbook={data.workbook}
          progress={data.progress}
        />
      </div>
    </>
  );
}
