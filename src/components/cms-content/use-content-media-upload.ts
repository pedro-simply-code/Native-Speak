"use client";

import { useCallback, useState } from "react";
import { appToast } from "@/lib/app-toast";
import { useUploadThing } from "@/lib/uploadthing";

function clientUploadFileUrl(
  file: { url: string; ufsUrl?: string | null } | undefined,
): string | null {
  if (!file) return null;
  return file.ufsUrl ?? file.url ?? null;
}

/** Single UploadThing hook for content cover + library (avoid duplicate contentMedia clients). */
export function useContentMediaUpload() {
  const [uploading, setUploading] = useState(false);

  const { startUpload, isUploading: hookUploading } = useUploadThing(
    "siteImage",
    {
      onUploadError: (error) => {
        appToast.error(error.message || "Upload failed.");
      },
    },
  );

  const uploadContentMediaFile = useCallback(
    async (file: File): Promise<string | null> => {
      setUploading(true);
      try {
        const result = await startUpload([file]);
        const url = clientUploadFileUrl(result?.[0]);
        if (!url) {
          appToast.error("Upload failed. Try again.");
          return null;
        }
        return url;
      } catch (error) {
        appToast.error(
          error instanceof Error ? error.message : "Upload failed.",
        );
        return null;
      } finally {
        setUploading(false);
      }
    },
    [startUpload],
  );

  return {
    uploadContentMediaFile,
    isUploading: uploading || hookUploading,
  };
}
