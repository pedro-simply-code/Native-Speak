"use client";

import { useState } from "react";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { CmsContentPanel } from "@/components/dashboard/admin/cms-content-panel";
import { MediaLibraryPanel } from "@/components/dashboard/admin/media-library-panel";
import type { cmsContents, siteMedia } from "@/server/db/schema";

type CmsRow = typeof cmsContents.$inferSelect;
type MediaRow = typeof siteMedia.$inferSelect;

export function AdminContentWorkspace({
  cmsRows,
  mediaRows,
  uploadthingEnabled,
  previewPosts,
}: {
  cmsRows: CmsRow[];
  mediaRows: MediaRow[];
  uploadthingEnabled: boolean;
  previewPosts: import("@/server/content/queries").PublicContentSummary[];
}) {
  const [tab, setTab] = useState(0);

  return (
    <div>
      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        className="mb-4"
      >
        <Tab label="Blog & pages (blocks)" />
        <Tab label="Media library" />
      </Tabs>
      {tab === 0 ? (
        <CmsContentPanel initial={cmsRows} previewPosts={previewPosts} />
      ) : null}
      {tab === 1 ? (
        <MediaLibraryPanel initial={mediaRows} uploadthingEnabled={uploadthingEnabled} />
      ) : null}
    </div>
  );
}
