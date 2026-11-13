"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { ContentMediaLibraryDialog } from "@/components/cms-content/content-media-library-dialog";
import { useContentMediaUpload } from "@/components/cms-content/use-content-media-upload";
import { appToast } from "@/lib/app-toast";
import { contentMediaFileError } from "@/lib/media-library";
import { userProfileImageUnoptimized } from "@/lib/project-image";
import { cn } from "@/lib/utils";

export function ContentCoverUpload({
  defaultUrl = "",
}: {
  defaultUrl?: string;
}) {
  const localPreviewRef = useRef<string | null>(null);
  const [baselineUrl] = useState(() => defaultUrl.trim());

  const [savedUrl, setSavedUrl] = useState(defaultUrl.trim());
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const { uploadContentMediaFile, isUploading } = useContentMediaUpload();

  const clearLocalPreview = () => {
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
    setLocalPreview(null);
  };

  const applyLibraryUrl = (url: string) => {
    clearLocalPreview();
    setSavedUrl(url);
  };

  const uploadFile = async (file: File) => {
    const validationError = contentMediaFileError(file);
    if (validationError) {
      appToast.error(validationError);
      return;
    }

    clearLocalPreview();
    const objectUrl = URL.createObjectURL(file);
    localPreviewRef.current = objectUrl;
    setLocalPreview(objectUrl);

    const url = await uploadContentMediaFile(file);
    if (url) {
      applyLibraryUrl(url);
      appToast.success("Image uploaded.");
    } else {
      clearLocalPreview();
    }
  };

  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    };
  }, []);

  const removeCover = () => {
    clearLocalPreview();
    setSavedUrl("");
  };

  const previewSrc = localPreview || savedUrl || null;
  const isDirty = savedUrl !== baselineUrl;
  const busy = isUploading;

  return (
    <>
      <input type="hidden" name="coverImageUrl" value={savedUrl} />

      <div
        className={cn(
          "relative aspect-[1000/560] overflow-hidden rounded-lg bg-sc-section-alt/95 shadow-[inset_0_1px_2px_rgba(21,19,15,0.04)] ring-1 ring-sc-accent/25",
          busy && "pointer-events-none opacity-80",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) void uploadFile(file);
        }}
      >
        {previewSrc ? (
          <Image
            src={previewSrc}
            alt="Cover preview"
            fill
            sizes="320px"
            className="object-cover"
            unoptimized={userProfileImageUnoptimized(previewSrc)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-sc-section-alt/90 px-4 text-center text-[#9a9488]">
            <Upload className="text-sc-accent/45 size-8" />
            <p className="text-[11px] font-semibold tracking-wide uppercase">
              No cover yet
            </p>
            <p className="text-[11px]">Choose from library or drop an image</p>
          </div>
        )}
        {busy ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#15130f]/35 text-white">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-[11px] font-semibold tracking-wide uppercase">
              Uploading…
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => setLibraryOpen(true)}
          className="hover:bg-[#15130f] rounded-md bg-sc-accent px-3 py-2 text-[10px] font-bold tracking-[0.14em] text-white uppercase transition-colors disabled:opacity-60"
        >
          {previewSrc ? "Choose another" : "Choose image"}
        </button>
        {previewSrc && !busy ? (
          <button
            type="button"
            onClick={removeCover}
            className="rounded-md bg-white px-3 py-2 text-[10px] font-bold tracking-[0.12em] uppercase shadow-[0_1px_2px_rgba(21,19,15,0.08)] hover:text-[#9a3b2e] hover:shadow-[0_2px_8px_rgba(154,59,46,0.12)]"
          >
            Remove cover
          </button>
        ) : null}
        {isDirty ? (
          <span className="text-sc-accent text-[10px] font-bold tracking-[0.1em] uppercase">
            Unsaved
          </span>
        ) : savedUrl ? (
          <span className="text-[10px] font-bold tracking-[0.1em] text-[#2e7d32] uppercase">
            Saved
          </span>
        ) : null}
      </div>

      <ContentMediaLibraryDialog
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        selectedUrl={savedUrl}
        onSelect={applyLibraryUrl}
        uploadFile={uploadContentMediaFile}
        isUploading={isUploading}
      />
    </>
  );
}
