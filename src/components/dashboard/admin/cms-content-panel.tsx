"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import {
  deleteCmsContent,
  upsertCmsContent,
} from "@/server/actions/cms";
import { locales } from "@/lib/i18n/config";
import {
  emptyContentDocument,
  parseContentDocument,
  type ContentDocument,
} from "@/lib/cms/content";
import type { cmsContents } from "@/server/db/schema";
import { ContentEditor } from "@/components/cms-lexical/content-editor";
import type { PublicContentSummary } from "@/server/content/queries";

type Row = typeof cmsContents.$inferSelect;

export function CmsContentPanel({
  initial,
  previewPosts,
}: {
  initial: Row[];
  previewPosts: PublicContentSummary[];
}) {
  const [rows, setRows] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    kind: "blog" as "blog" | "page",
    slug: "",
    locale: "en" as (typeof locales)[number],
    title: "",
    excerpt: "",
    coverImageUrl: "",
    readMinutes: 5,
  });
  const [editDocument, setEditDocument] = useState<unknown | null>(null);

  function readEditorBody(): string | undefined {
    const input = document.querySelector(
      '#cms-create-form input[name="body"]',
    ) as HTMLInputElement | null;
    return input?.value || undefined;
  }

  async function createEntry(publish: boolean) {
    const payload = {
      ...form,
      publish,
      body: readEditorBody(),
    };
    const res = await upsertCmsContent(payload);
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    setMsg(publish ? "Published." : "Saved as draft.");
    setForm((f) => ({
      ...f,
      slug: "",
      title: "",
      excerpt: "",
      coverImageUrl: "",
    }));
    setEditDocument(null);
    window.location.reload();
  }

  async function remove(id: string) {
    const res = await deleteCmsContent(id);
    setMsg(res.ok ? "Deleted." : res.error);
    if (res.ok) setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const initialDoc: ContentDocument | null =
    parseContentDocument(editDocument) ?? emptyContentDocument();

  return (
    <div className="space-y-6">
      {msg ? <p className="text-sm text-[var(--dash-muted)]">{msg}</p> : null}
      <p className="text-xs text-[var(--dash-muted)]">
        Editor de bloques Lexical (Simply Code): secciones editables en canvas, blog
        listing, hero, steps, CTA, etc. El JSON se guarda en{" "}
        <code>body_lexical</code>; el texto plano se genera para SEO y fallback.
      </p>
      <div className="dash-card space-y-3 p-4">
        <p className="font-semibold">New blog post or page</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            select
            size="small"
            label="Type"
            value={form.kind}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                kind: e.target.value as "blog" | "page",
              }))
            }
          >
            <MenuItem value="blog">Blog</MenuItem>
            <MenuItem value="page">Site page</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Locale"
            value={form.locale}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                locale: e.target.value as (typeof locales)[number],
              }))
            }
          >
            {locales.map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Slug (a-z, 0-9, -)"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
          <TextField
            size="small"
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <TextField
            size="small"
            label="Cover image URL"
            value={form.coverImageUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, coverImageUrl: e.target.value }))
            }
            className="sm:col-span-2"
          />
          <TextField
            size="small"
            label="Excerpt"
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            className="sm:col-span-2"
          />
        </div>

        <Resources id="cms-create-form" className="cms-block-studio mt-4 min-w-0">
          <ContentEditor
            key={editDocument ? "editing" : "new"}
            namespace="native-speak-cms"
            initialDocument={initialDoc}
            previewPosts={previewPosts}
          />
        </Resources>

        <div className="flex gap-2">
          <Button variant="outlined" onClick={() => void createEntry(false)}>
            Save draft
          </Button>
          <Button variant="contained" onClick={() => void createEntry(true)}>
            Publish
          </Button>
        </div>
        <p className="text-xs text-[var(--dash-muted)]">
          Pages with block layout render at /p/[slug] when published. Posts at
          /blog/[slug].
        </p>
      </div>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="dash-card flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
          >
            <span>
              <strong>{row.title}</strong> · {row.kind} · {row.status} · /
              {row.slug}
            </span>
            <div className="flex gap-2">
              <Button
                size="small"
                onClick={() => {
                  setEditDocument(row.bodyLexical ?? parseContentDocument(null));
                  setForm((f) => ({
                    ...f,
                    kind: row.kind,
                    slug: row.slug,
                    locale: row.locale as (typeof locales)[number],
                    title: row.title,
                    excerpt: row.excerpt ?? "",
                    coverImageUrl: row.coverImageUrl ?? "",
                    readMinutes: row.readMinutes ?? 5,
                  }));
                }}
              >
                Load in editor
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => void remove(row.id)}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Resources({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className={className}>
      {children}
    </div>
  );
}
