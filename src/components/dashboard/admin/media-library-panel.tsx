"use client";

import { useRef, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { UploadButton } from "@/lib/uploadthing";
import {
  deleteSiteMedia,
  updateSiteMediaAlt,
  uploadSiteMediaLocal,
} from "@/server/actions/site-media";
import type { siteMedia } from "@/server/db/schema";

type Row = typeof siteMedia.$inferSelect;

export function MediaLibraryPanel({
  initial,
  uploadthingEnabled,
  onPick,
  pickMode = false,
}: {
  initial: Row[];
  uploadthingEnabled: boolean;
  onPick?: (media: Row) => void;
  pickMode?: boolean;
}) {
  const [rows, setRows] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function refreshAfterUpload() {
    const res = await fetch("/dashboard/admin/content", { method: "HEAD" });
    void res;
    window.location.reload();
  }

  async function uploadLocal(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadSiteMediaLocal(fd);
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    setRows((prev) => [res.media, ...prev]);
    setMsg("Uploaded.");
  }

  async function saveAlt(id: string, altText: string) {
    const res = await updateSiteMediaAlt(id, altText);
    setMsg(res.ok ? "Alt text saved." : res.error);
    if (res.ok) {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, altText } : r)),
      );
    }
  }

  async function remove(id: string) {
    const res = await deleteSiteMedia(id);
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id));
    setMsg(res.ok ? "Deleted." : res.error);
  }

  return (
    <div className="space-y-4">
      {msg ? <p className="text-sm text-[var(--dash-muted)]">{msg}</p> : null}
      <div className="dash-card flex flex-wrap items-center gap-3 p-4">
        {uploadthingEnabled ? (
          <UploadButton
            endpoint="siteImage"
            onClientUploadComplete={() => void refreshAfterUpload()}
            onUploadError={(e) => setMsg(e.message)}
          />
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadLocal(file);
              }}
            />
            <Button variant="contained" onClick={() => fileRef.current?.click()}>
              Upload image (local)
            </Button>
            <p className="text-xs text-[var(--dash-muted)]">
              Set UPLOADTHING_TOKEN in .env to use cloud uploads.
            </p>
          </>
        )}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <li key={row.id} className="dash-card space-y-2 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={row.url}
              alt={row.altText ?? row.fileName}
              className="h-40 w-full rounded-md object-cover"
            />
            <p className="truncate text-xs text-[var(--dash-muted)]">{row.fileName}</p>
            <TextField
              size="small"
              fullWidth
              label="Alt text"
              defaultValue={row.altText ?? ""}
              onBlur={(e) => void saveAlt(row.id, e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {pickMode && onPick ? (
                <Button size="small" variant="contained" onClick={() => onPick(row)}>
                  Use image
                </Button>
              ) : null}
              <Button size="small" color="error" onClick={() => void remove(row.id)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
