"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {
  listTeacherApplicationsQueue,
  reviewTeacherApplication,
} from "@/server/actions/teacher-application";

type Row = Awaited<ReturnType<typeof listTeacherApplicationsQueue>>[number];

export function TeacherApplicationsPanel({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function review(id: string, approve: boolean) {
    setLoadingId(id);
    const res = await reviewTeacherApplication({
      applicationId: id,
      approve,
      reviewNote: notes[id],
    });
    setLoadingId(null);
    if (res.ok) {
      setRows((prev) => prev.filter((r) => r.application.id !== id));
      setMsg(approve ? "Approved." : "Rejected.");
    } else {
      setMsg(res.error);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="dash-card p-5 text-sm text-[var(--dash-muted)]">
        No teacher applications waiting for review.
      </div>
    );
  }

  return (
    <>
      {msg ? <p className="mb-3 text-sm text-[var(--dash-muted)]">{msg}</p> : null}
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.application.id} className="dash-card p-4 text-sm">
            <p className="font-semibold">
              {row.name ?? row.email}
              <span className="ml-2 font-normal text-[var(--dash-muted)]">
                {row.application.status.replace("_", " ")}
              </span>
            </p>
            <p className="text-[var(--dash-muted)]">{row.email}</p>
            <p className="mt-1">
              Submitted {row.application.createdAt.toLocaleString()}
            </p>
            {row.application.documentUrls.length > 0 ? (
              <ul className="mt-2 list-disc pl-5">
                {row.application.documentUrls.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--dash-primary)] underline"
                    >
                      Document
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[var(--dash-muted)]">No document URLs.</p>
            )}
            <TextField
              className="mt-3"
              size="small"
              fullWidth
              label="Note to teacher (optional)"
              value={notes[row.application.id] ?? ""}
              onChange={(e) =>
                setNotes((prev) => ({
                  ...prev,
                  [row.application.id]: e.target.value,
                }))
              }
            />
            <div className="mt-3 flex gap-2">
              <Button
                size="small"
                variant="contained"
                disabled={loadingId === row.application.id}
                onClick={() => void review(row.application.id, true)}
              >
                Approve
              </Button>
              <Button
                size="small"
                color="error"
                variant="outlined"
                disabled={loadingId === row.application.id}
                onClick={() => void review(row.application.id, false)}
              >
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
