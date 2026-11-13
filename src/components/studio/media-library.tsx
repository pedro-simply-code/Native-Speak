"use client";

import { MediaLibraryPanel } from "@/components/dashboard/admin/media-library-panel";
import { isUploadthingEnabled } from "@/lib/uploadthing/is-enabled";
import type { siteMedia } from "@/server/db/schema";

type Row = typeof siteMedia.$inferSelect;

export function MediaLibrary({
  initial = [],
  onSelect,
}: {
  initial?: Row[];
  onSelect?: (url: string) => void;
  variant?: string;
  selectedUrl?: string;
  uploadFile?: (file: File) => Promise<string | null>;
  isUploading?: boolean;
  selectOnUpload?: boolean;
}) {
  return (
    <MediaLibraryPanel
      initial={initial}
      uploadthingEnabled={isUploadthingEnabled()}
      pickMode={Boolean(onSelect)}
      onPick={
        onSelect
          ? (row) => onSelect(row.url)
          : undefined
      }
    />
  );
}
