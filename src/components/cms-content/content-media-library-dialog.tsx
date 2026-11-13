"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaLibrary } from "@/components/studio/media-library";
import {
  appOutlineButton,
  appPrimaryButtonStudio,
} from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

type ContentMediaLibraryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUrl?: string;
  onSelect: (url: string) => void;
  uploadFile: (file: File) => Promise<string | null>;
  isUploading: boolean;
};

function AttachmentPreview({ url }: { url: string }) {
  return (
    <div className="flex flex-col gap-3 p-5">
      <p className="text-[10px] font-bold tracking-[0.14em] text-[#6f6a60] uppercase">
        Attachment details
      </p>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-white ring-1 ring-[#15130f]/10">
        <Image
          src={url}
          alt="Selected cover preview"
          fill
          sizes="280px"
          className="object-contain"
        />
      </div>
      <p className="text-xs leading-relaxed break-all text-[#57524a]">{url}</p>
      <p className="text-xs leading-relaxed text-[#6f6a60]">
        Click <span className="font-semibold text-[#15130f]">Use this image</span>{" "}
        when you are ready to set the cover. Uploads stay in the library until
        you confirm.
      </p>
    </div>
  );
}

function ContentMediaLibraryDialogBody({
  selectedUrl = "",
  onSelect,
  onOpenChange,
  uploadFile,
  isUploading,
}: Omit<ContentMediaLibraryDialogProps, "open">) {
  const [pendingUrl, setPendingUrl] = useState(selectedUrl);

  const handlePendingUrl = useCallback((url: string) => {
    setPendingUrl(url);
  }, []);

  const confirmSelection = () => {
    if (!pendingUrl) return;
    onSelect(pendingUrl);
    onOpenChange(false);
  };

  return (
    <>
      <DialogHeader className="shrink-0 border-b border-[#15130f]/10 bg-white px-5 py-4 text-left">
        <DialogTitle className="text-sm font-black tracking-tight text-[#15130f] uppercase">
          Choose cover image
        </DialogTitle>
        <DialogDescription className="text-sm text-[#57524a]">
          Media library — upload or pick an image, then confirm below.
        </DialogDescription>
      </DialogHeader>

      <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
          <div className="min-h-0 flex-1 overflow-hidden p-4">
            <MediaLibrary
              variant="overlay"
              selectedUrl={pendingUrl}
              uploadFile={uploadFile}
              isUploading={isUploading}
              selectOnUpload
              onSelect={handlePendingUrl}
            />
          </div>
        </div>

        <aside className="hidden w-72 shrink-0 flex-col border-l border-[#15130f]/10 bg-[#f6f7f7] sm:flex">
          {pendingUrl ? (
            <AttachmentPreview url={pendingUrl} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-[#6f6a60]">
              <div className="flex size-12 items-center justify-center rounded-full bg-white ring-1 ring-[#15130f]/10">
                <Check className="size-5 opacity-40" />
              </div>
              <p className="text-sm font-semibold text-[#57524a]">
                No image selected
              </p>
              <p className="text-xs leading-relaxed">
                Select a thumbnail or upload a file. The cover updates only
                after you press Use this image.
              </p>
            </div>
          )}
        </aside>
      </div>

      {pendingUrl ? (
        <div className="border-t border-[#15130f]/10 bg-[#f6f7f7] px-4 py-3 sm:hidden">
          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-md bg-white ring-1 ring-[#15130f]/10">
            <Image
              src={pendingUrl}
              alt="Selected preview"
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}

      <DialogFooter className="shrink-0 flex-row items-center justify-between gap-3 border-t border-[#15130f]/10 bg-white px-5 py-3 sm:justify-between">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className={cn(appOutlineButton, "px-4 py-2 text-[10px]")}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!pendingUrl || isUploading}
          onClick={confirmSelection}
          className={cn(
            appPrimaryButtonStudio,
            "px-5 py-2.5 disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          Use this image
        </button>
      </DialogFooter>
    </>
  );
}

export function ContentMediaLibraryDialog({
  open,
  onOpenChange,
  selectedUrl = "",
  onSelect,
  uploadFile,
  isUploading,
}: ContentMediaLibraryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(90vh,640px)] w-[min(96vw,960px)] max-w-none flex-col gap-0 overflow-hidden border border-[#15130f]/10 bg-[#f0f0f1] p-0 shadow-[0_12px_40px_rgba(21,19,15,0.22)] sm:max-w-none"
        showCloseButton
      >
        {open ? (
          <ContentMediaLibraryDialogBody
            key={selectedUrl}
            selectedUrl={selectedUrl}
            onSelect={onSelect}
            onOpenChange={onOpenChange}
            uploadFile={uploadFile}
            isUploading={isUploading}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
