"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { nanoid } from "nanoid";
import {
  listStudyWorkbooksForTeacher,
  upsertStudyWorkbook,
} from "@/server/actions/study-workbooks";
import type { StudyBlock } from "@/server/db/schema";

type Row = Awaited<ReturnType<typeof listStudyWorkbooksForTeacher>>[number];
type Family = { id: string; email: string; name: string | null };

export function StudyBuilderPanel({
  initial,
  families,
}: {
  initial: Row[];
  families: Family[];
}) {
  const [rows, setRows] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [familyUserId, setFamilyUserId] = useState(families[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [blocks, setBlocks] = useState<StudyBlock[]>([
    {
      id: nanoid(10),
      type: "note",
      title: "Lesson summary",
      body: "Key vocabulary and goals for this week.",
    },
    {
      id: nanoid(10),
      type: "exercise",
      title: "Practice",
      instructions: "Write 5 sentences using the new verbs.",
    },
  ]);

  function addBlock(type: StudyBlock["type"]) {
    const id = nanoid(10);
    if (type === "note") {
      setBlocks((b) => [...b, { id, type: "note", title: "Note", body: "" }]);
    } else if (type === "exercise") {
      setBlocks((b) => [
        ...b,
        { id, type: "exercise", title: "Exercise", instructions: "" },
      ]);
    } else {
      setBlocks((b) => [
        ...b,
        { id, type: "resource", title: "Resource", url: "https://" },
      ]);
    }
  }

  async function publish(publish: boolean) {
    if (!familyUserId || !title.trim()) {
      setMsg("Pick a family and title.");
      return;
    }
    const res = await upsertStudyWorkbook({
      familyUserId,
      title,
      description,
      blocks,
      publish,
    });
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    setMsg(publish ? "Published for family." : "Saved draft.");
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      {msg ? <p className="text-sm text-[var(--dash-muted)]">{msg}</p> : null}
      <div className="dash-card space-y-3 p-4 text-sm">
        <p className="font-semibold">Study workbook builder</p>
        <TextField
          select
          fullWidth
          size="small"
          label="Family account"
          value={familyUserId}
          onChange={(e) => setFamilyUserId(e.target.value)}
        >
          {families.map((f) => (
            <MenuItem key={f.id} value={f.id}>
              {f.name ?? f.email}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          size="small"
          label="Workbook title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={2}
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div key={block.id} className="rounded border border-[var(--dash-border)] p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-[var(--dash-muted)]">
                {block.type} #{index + 1}
              </p>
              <TextField
                fullWidth
                size="small"
                label="Section title"
                value={block.title}
                className="mb-2"
                onChange={(e) =>
                  setBlocks((prev) =>
                    prev.map((b) =>
                      b.id === block.id ? { ...b, title: e.target.value } : b,
                    ),
                  )
                }
              />
              {block.type === "note" ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Notes for the student"
                  value={block.body}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id && b.type === "note"
                          ? { ...b, body: e.target.value }
                          : b,
                      ),
                    )
                  }
                />
              ) : null}
              {block.type === "exercise" ? (
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  size="small"
                  label="Instructions"
                  value={block.instructions}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id && b.type === "exercise"
                          ? { ...b, instructions: e.target.value }
                          : b,
                      ),
                    )
                  }
                />
              ) : null}
              {block.type === "resource" ? (
                <TextField
                  fullWidth
                  size="small"
                  label="URL"
                  value={block.url}
                  onChange={(e) =>
                    setBlocks((prev) =>
                      prev.map((b) =>
                        b.id === block.id && b.type === "resource"
                          ? { ...b, url: e.target.value }
                          : b,
                      ),
                    )
                  }
                />
              ) : null}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="small" onClick={() => addBlock("note")}>
            + Note
          </Button>
          <Button size="small" onClick={() => addBlock("exercise")}>
            + Exercise
          </Button>
          <Button size="small" onClick={() => addBlock("resource")}>
            + Link
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" onClick={() => void publish(false)}>
            Save draft
          </Button>
          <Button variant="contained" onClick={() => void publish(true)}>
            Publish
          </Button>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {rows.map(({ workbook, familyEmail }) => (
          <li key={workbook.id} className="dash-card p-3">
            <p className="font-semibold">{workbook.title}</p>
            <p className="text-[var(--dash-muted)]">
              {workbook.status} · {familyEmail} · {(workbook.blocks as StudyBlock[]).length} sections
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
