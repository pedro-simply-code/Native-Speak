import { Suspense } from "react";
import { DashboardPageHeader } from "@/components/dashboard/modernize/dashboard-page-header";
import { DashboardLoadingPlaceholder } from "@/components/dashboard/modernize/dashboard-loading-placeholder";
import { AdminContentWorkspace } from "@/components/dashboard/admin/admin-content-workspace";
import { isUploadthingEnabled } from "@/lib/uploadthing/is-enabled";
import { listPublishedEntriesSafe } from "@/server/content/queries";
import { listAllCmsForAdmin } from "@/server/queries/cms";
import { listSiteMediaForAdmin } from "@/server/queries/site-media";

type MediaRows = Awaited<ReturnType<typeof listSiteMediaForAdmin>>;

async function ContentWorkspaceSection() {
  const entries = await listAllCmsForAdmin();
  const previewPosts = await listPublishedEntriesSafe("post");

  let media: MediaRows = [];
  try {
    media = await listSiteMediaForAdmin();
  } catch {
    media = [];
  }

  return (
    <div className="mt-6">
      <AdminContentWorkspace
        cmsRows={entries}
        mediaRows={media}
        uploadthingEnabled={isUploadthingEnabled()}
        previewPosts={previewPosts}
      />
    </div>
  );
}

export default function AdminContentPage() {
  return (
    <>
      <DashboardPageHeader
        title="Content studio"
        description="Simply Code–style Lexical block editor for pages and blog posts, plus media library (UploadThing or local)."
      />
      <Suspense
        fallback={<DashboardLoadingPlaceholder label="Loading content studio…" />}
      >
        <ContentWorkspaceSection />
      </Suspense>
    </>
  );
}
