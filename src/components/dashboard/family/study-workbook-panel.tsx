"use client";

import { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import { saveStudyProgress } from "@/server/actions/study-workbooks";
import type { StudyBlock } from "@/server/db/schema";
import type { studyProgressLogs, studyWorkbooks } from "@/server/db/schema";

type Progress = typeof studyProgressLogs.$inferSelect;
type Workbook = typeof studyWorkbooks.$inferSelect;

export function StudyWorkbookPanel({
  workbook,
  progress,
}: {
  workbook: Workbook;
  progress: Progress[];
}) {
  const blocks = workbook.blocks as StudyBlock[];
  const byBlock = useMemo(
    () => new Map(progress.map((p) => [p.blockId, p])),
    [progress],
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  async function saveBlock(blockId: string, completed: boolean) {
    const res = await saveStudyProgress({
      workbookId: workbook.id,
      blockId,
      reflection: drafts[blockId] ?? byBlock.get(blockId)?.reflection ?? "",
      completed,
    });
    setMsg(res.ok ? "Saved." : res.error ?? "Error");
  }

  const doneCount = blocks.filter((b) => byBlock.get(b.id)?.completed).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--dash-muted)]">
        Progress: {doneCount} / {blocks.length} sections
      </p>
      {msg ? <p className="text-sm text-[var(--dash-muted)]">{msg}</p> : null}
      {workbook.description ? (
        <p className="dash-card p-4 text-sm">{workbook.description}</p>
      ) : null}
      <ul className="space-y-4">
        {blocks.map((block) => {
          const saved = byBlock.get(block.id);
          return (
            <li key={block.id} className="dash-card space-y-3 p-4 text-sm">
              <p className="font-semibold">
                {block.title}{" "}
                <span className="font-normal text-[var(--dash-muted)]">
                  ({block.type})
                </span>
              </p>
              {block.type === "note" ? (
                <p className="text-[var(--dash-muted)] whitespace-pre-wrap">{block.body}</p>
              ) : null}
              {block.type === "exercise" ? (
                <p className="text-[var(--dash-muted)] whitespace-pre-wrap">
                  {block.instructions}
                </p>
              ) : null}
              {block.type === "resource" ? (
                <a
                  href={block.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--dash-primary)] underline"
                >
                  Open material
                </a>
              ) : null}
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label="What I learned / my answers"
                value={
                  drafts[block.id] ?? saved?.reflection ?? ""
                }
                onChange={(e) =>
                  setDrafts((d) => ({ ...d, [block.id]: e.target.value }))
                }
              />
              <div className="flex flex-wrap items-center gap-3">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saved?.completed ?? false}
                      onChange={(e) => void saveBlock(block.id, e.target.checked)}
                    />
                  }
                  label="Mark complete"
                />
                <Button size="small" variant="outlined" onClick={() => void saveBlock(block.id, saved?.completed ?? false)}>
                  Save notes
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
