"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { LexicalEditor } from "@/components/lexical/lexical-editor";
import { BlockAddLine, BlockRemoveLine } from "@/components/dashboard/admin/block-chrome";
import { EditableText } from "@/components/dashboard/admin/editable-text";
import { locales } from "@/lib/i18n/config";
import {
  MARKETING_PAGE_KEYS,
  MARKETING_PAGE_LABELS,
  type MarketingPageKey,
} from "@/lib/marketing/page-keys";
import {
  loadMarketingPageDraft,
  resetMarketingPageDraft,
  saveMarketingPageBlocks,
} from "@/server/actions/marketing-pages";
import type { MarketingBlock } from "@/server/db/schema";
import type { siteMedia } from "@/server/db/schema";
import { MediaLibraryPanel } from "@/components/dashboard/admin/media-library-panel";

type MediaRow = typeof siteMedia.$inferSelect;

const BLOCK_TYPE_LABELS: Record<MarketingBlock["type"], string> = {
  hero: "Hero",
  stats: "Stats",
  steps: "Steps",
  features: "Features",
  bullets: "Bullet list",
  richText: "Rich text",
  image: "Image",
  cta: "Call to action",
};

function newBlock(type: MarketingBlock["type"]): MarketingBlock {
  const id = nanoid(10);
  switch (type) {
    case "hero":
      return {
        id,
        type: "hero",
        eyebrow: "",
        title: "",
        subtitle: "",
        highlights: [""],
        ctaLabel: "",
        ctaHref: "/",
      };
    case "stats":
      return { id, type: "stats", items: [{ value: "0", label: "Label" }] };
    case "steps":
      return {
        id,
        type: "steps",
        title: "",
        steps: [{ step: "1", title: "", body: "" }],
      };
    case "features":
      return { id, type: "features", title: "", items: [{ title: "", body: "" }] };
    case "bullets":
      return { id, type: "bullets", title: "", bullets: [""] };
    case "richText":
      return { id, type: "richText", title: "", lexicalState: null };
    case "image":
      return { id, type: "image", alt: "", url: "" };
    case "cta":
      return {
        id,
        type: "cta",
        title: "",
        body: "",
        buttonLabel: "",
        buttonHref: "/",
      };
    default:
      return { id, type: "richText", lexicalState: null };
  }
}

export function MarketingBlocksPanel({
  media,
  uploadthingEnabled,
}: {
  media: MediaRow[];
  uploadthingEnabled: boolean;
}) {
  const [pageKey, setPageKey] = useState<MarketingPageKey>("home");
  const [locale, setLocale] = useState<(typeof locales)[number]>("en");
  const [blocks, setBlocks] = useState<MarketingBlock[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [mediaPickBlockId, setMediaPickBlockId] = useState<string | null>(null);

  const draftKey = `${pageKey}:${locale}`;
  const loading = loadedKey !== draftKey;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await loadMarketingPageDraft(pageKey, locale);
      if (cancelled) return;
      setLoadedKey(`${pageKey}:${locale}`);
      if (!res.ok) {
        setMsg(res.error);
        return;
      }
      setBlocks(res.draft.blocks);
      setMsg(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [pageKey, locale]);

  function patchBlock(id: string, next: MarketingBlock) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? next : b)));
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  }

  async function save() {
    const res = await saveMarketingPageBlocks({ pageKey, locale, blocks });
    setMsg(res.ok ? "Draft saved. Public site still uses static pages." : res.error);
  }

  async function resetDefaults() {
    const res = await resetMarketingPageDraft({ pageKey, locale });
    if (res.ok) {
      setBlocks(res.blocks);
      setMsg("Reset to default blocks from static content.");
    } else {
      setMsg(res.error);
    }
  }

  function applyMediaToBlock(mediaRow: MediaRow) {
    if (!mediaPickBlockId) return;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== mediaPickBlockId) return b;
        if (b.type === "image") {
          return {
            ...b,
            mediaId: mediaRow.id,
            url: mediaRow.url,
            alt: mediaRow.altText ?? b.alt,
          };
        }
        if (b.type === "hero") {
          return { ...b, imageMediaId: mediaRow.id, imageUrl: mediaRow.url };
        }
        return b;
      }),
    );
    setMediaPickBlockId(null);
  }

  return (
    <div className="space-y-4">
      {msg ? <p className="text-sm text-[var(--dash-muted)]">{msg}</p> : null}
      <p className="text-xs text-[var(--dash-muted)]">
        Haz clic en el texto del bloque para editarlo (sin formularios). Los borradores se guardan en
        la base de datos; el sitio público sigue en páginas estáticas hasta publicar.
      </p>
      <div className="dash-card grid gap-3 p-4 sm:grid-cols-3">
        <TextField
          select
          size="small"
          label="Page"
          value={pageKey}
          onChange={(e) => setPageKey(e.target.value as MarketingPageKey)}
        >
          {MARKETING_PAGE_KEYS.map((key) => (
            <MenuItem key={key} value={key}>
              {MARKETING_PAGE_LABELS[key]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Locale"
          value={locale}
          onChange={(e) =>
            setLocale(e.target.value as (typeof locales)[number])
          }
        >
          {locales.map((loc) => (
            <MenuItem key={loc} value={loc}>
              {loc}
            </MenuItem>
          ))}
        </TextField>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="contained" disabled={loading} onClick={() => void save()}>
            Save draft
          </Button>
          <Button variant="outlined" disabled={loading} onClick={() => void resetDefaults()}>
            Reset defaults
          </Button>
        </div>
      </div>

      {mediaPickBlockId ? (
        <div className="dash-card space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">Pick an image</p>
            <Button size="small" onClick={() => setMediaPickBlockId(null)}>
              Cancel
            </Button>
          </div>
          <MediaLibraryPanel
            initial={media}
            uploadthingEnabled={uploadthingEnabled}
            pickMode
            onPick={applyMediaToBlock}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {(Object.keys(BLOCK_TYPE_LABELS) as MarketingBlock["type"][]).map((type) => (
          <Button
            key={type}
            size="small"
            variant="outlined"
            onClick={() => setBlocks((prev) => [...prev, newBlock(type)])}
          >
            + {BLOCK_TYPE_LABELS[type]}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--dash-muted)]">Loading…</p>
      ) : (
        <ul className="space-y-4">
          {blocks.map((block) => (
            <li key={block.id} className="dash-card space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{BLOCK_TYPE_LABELS[block.type]}</strong>
                <div>
                  <IconButton size="small" onClick={() => moveBlock(block.id, -1)} aria-label="Move up">
                    <ArrowUpwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => moveBlock(block.id, 1)} aria-label="Move down">
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setBlocks((prev) => prev.filter((b) => b.id !== block.id))}
                    aria-label="Remove block"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
              <BlockPreview
                block={block}
                onChange={(next) => patchBlock(block.id, next)}
                onPickImage={
                  block.type === "image" || block.type === "hero"
                    ? () => setMediaPickBlockId(block.id)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BlockPreview({
  block,
  onChange,
  onPickImage,
}: {
  block: MarketingBlock;
  onChange: (b: MarketingBlock) => void;
  onPickImage?: () => void;
}) {
  switch (block.type) {
    case "hero":
      return (
        <div className="block-preview">
          <EditableText
            value={block.eyebrow}
            onChange={(eyebrow) => onChange({ ...block, eyebrow })}
            placeholder="Eyebrow"
            variant="eyebrow"
            ariaLabel="Hero eyebrow"
          />
          <EditableText
            value={block.title}
            onChange={(title) => onChange({ ...block, title })}
            placeholder="Headline"
            variant="title"
            ariaLabel="Hero title"
          />
          <EditableText
            value={block.subtitle}
            onChange={(subtitle) => onChange({ ...block, subtitle })}
            placeholder="Supporting line"
            variant="subtitle"
            multiline
            ariaLabel="Hero subtitle"
          />
          <ul className="block-preview-bullets">
            {block.highlights.map((h, i) => (
              <li key={i} className="block-preview-row">
                <EditableText
                  value={h}
                  onChange={(next) => {
                    const highlights = [...block.highlights];
                    highlights[i] = next;
                    onChange({ ...block, highlights });
                  }}
                  placeholder="Highlight"
                  variant="body"
                  className="flex-1"
                  ariaLabel={`Highlight ${i + 1}`}
                />
                {block.highlights.length > 1 ? (
                  <BlockRemoveLine
                    onClick={() =>
                      onChange({
                        ...block,
                        highlights: block.highlights.filter((_, j) => j !== i),
                      })
                    }
                  />
                ) : null}
              </li>
            ))}
          </ul>
          <BlockAddLine onClick={() => onChange({ ...block, highlights: [...block.highlights, ""] })}>
            + Add highlight
          </BlockAddLine>
          <div className="flex flex-wrap items-center gap-3">
            <span className="block-preview-cta-btn">
              <EditableText
                value={block.ctaLabel}
                onChange={(ctaLabel) => onChange({ ...block, ctaLabel })}
                placeholder="Button label"
                variant="inline"
                ariaLabel="CTA label"
              />
            </span>
            <EditableText
              value={block.ctaHref}
              onChange={(ctaHref) => onChange({ ...block, ctaHref: ctaHref || "/" })}
              placeholder="/link-path"
              variant="link"
              ariaLabel="CTA link"
            />
          </div>
          {onPickImage ? (
            <button type="button" className="block-pick-image" onClick={onPickImage}>
              {block.imageUrl ? "Change hero image" : "+ Add hero image"}
            </button>
          ) : null}
          {block.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.imageUrl} alt="" className="max-h-40 rounded-lg object-cover" />
          ) : null}
        </div>
      );
    case "stats":
      return (
        <div className="block-preview">
          <div className="block-preview-stats">
          {block.items.map((item, i) => (
            <div key={i} className="relative">
              {block.items.length > 1 ? (
                <BlockRemoveLine
                  onClick={() =>
                    onChange({
                      ...block,
                      items: block.items.filter((_, j) => j !== i),
                    })
                  }
                />
              ) : null}
              <EditableText
                value={item.value}
                onChange={(value) => {
                  const items = [...block.items];
                  items[i] = { ...item, value };
                  onChange({ ...block, items });
                }}
                placeholder="99%"
                variant="statValue"
                ariaLabel="Stat value"
              />
              <EditableText
                value={item.label}
                onChange={(label) => {
                  const items = [...block.items];
                  items[i] = { ...item, label };
                  onChange({ ...block, items });
                }}
                placeholder="Stat label"
                variant="statLabel"
                ariaLabel="Stat label"
              />
            </div>
          ))}
          </div>
          <BlockAddLine
            onClick={() =>
              onChange({ ...block, items: [...block.items, { value: "", label: "" }] })
            }
          >
            + Add stat
          </BlockAddLine>
        </div>
      );
    case "steps":
      return (
        <div className="block-preview">
          {block.eyebrow !== undefined ? (
            <EditableText
              value={block.eyebrow ?? ""}
              onChange={(eyebrow) => onChange({ ...block, eyebrow })}
              placeholder="Eyebrow"
              variant="eyebrow"
              ariaLabel="Steps eyebrow"
            />
          ) : null}
          <EditableText
            value={block.title}
            onChange={(title) => onChange({ ...block, title })}
            placeholder="Section title"
            variant="title"
            ariaLabel="Steps title"
          />
          <EditableText
            value={block.subtitle ?? ""}
            onChange={(subtitle) => onChange({ ...block, subtitle })}
            placeholder="Section intro"
            variant="subtitle"
            multiline
            ariaLabel="Steps subtitle"
          />
          {block.steps.map((step, i) => (
            <div key={i} className="block-preview-step">
              <div className="block-preview-row">
                <EditableText
                  value={step.step}
                  onChange={(next) => {
                    const steps = [...block.steps];
                    steps[i] = { ...step, step: next };
                    onChange({ ...block, steps });
                  }}
                  placeholder="1"
                  variant="stepIndex"
                  ariaLabel="Step number"
                />
                <EditableText
                  value={step.title}
                  onChange={(title) => {
                    const steps = [...block.steps];
                    steps[i] = { ...step, title };
                    onChange({ ...block, steps });
                  }}
                  placeholder="Step title"
                  variant="body"
                  className="flex-1 font-semibold"
                  ariaLabel="Step title"
                />
                {block.steps.length > 1 ? (
                  <BlockRemoveLine
                    onClick={() =>
                      onChange({
                        ...block,
                        steps: block.steps.filter((_, j) => j !== i),
                      })
                    }
                  />
                ) : null}
              </div>
              <EditableText
                value={step.body}
                onChange={(body) => {
                  const steps = [...block.steps];
                  steps[i] = { ...step, body };
                  onChange({ ...block, steps });
                }}
                placeholder="Step description"
                variant="body"
                multiline
                ariaLabel="Step body"
              />
            </div>
          ))}
          <BlockAddLine
            onClick={() =>
              onChange({
                ...block,
                steps: [
                  ...block.steps,
                  { step: String(block.steps.length + 1), title: "", body: "" },
                ],
              })
            }
          >
            + Add step
          </BlockAddLine>
        </div>
      );
    case "features":
      return (
        <div className="block-preview">
          <EditableText
            value={block.title}
            onChange={(title) => onChange({ ...block, title })}
            placeholder="Section title"
            variant="title"
            ariaLabel="Features title"
          />
          <EditableText
            value={block.subtitle ?? ""}
            onChange={(subtitle) => onChange({ ...block, subtitle })}
            placeholder="Section intro"
            variant="subtitle"
            multiline
            ariaLabel="Features subtitle"
          />
          {block.items.map((item, i) => (
            <div key={i} className="block-preview-step">
              <div className="block-preview-row">
                <EditableText
                  value={item.title}
                  onChange={(title) => {
                    const items = [...block.items];
                    items[i] = { ...item, title };
                    onChange({ ...block, items });
                  }}
                  placeholder="Feature title"
                  variant="body"
                  className="flex-1 font-semibold"
                  ariaLabel="Feature title"
                />
                {block.items.length > 1 ? (
                  <BlockRemoveLine
                    onClick={() =>
                      onChange({
                        ...block,
                        items: block.items.filter((_, j) => j !== i),
                      })
                    }
                  />
                ) : null}
              </div>
              <EditableText
                value={item.body}
                onChange={(body) => {
                  const items = [...block.items];
                  items[i] = { ...item, body };
                  onChange({ ...block, items });
                }}
                placeholder="Feature description"
                variant="body"
                multiline
                ariaLabel="Feature body"
              />
            </div>
          ))}
          <BlockAddLine
            onClick={() =>
              onChange({ ...block, items: [...block.items, { title: "", body: "" }] })
            }
          >
            + Add feature
          </BlockAddLine>
        </div>
      );
    case "bullets":
      return (
        <div className="block-preview">
          <EditableText
            value={block.title}
            onChange={(title) => onChange({ ...block, title })}
            placeholder="List title"
            variant="title"
            ariaLabel="Bullets title"
          />
          <EditableText
            value={block.intro ?? ""}
            onChange={(intro) => onChange({ ...block, intro })}
            placeholder="Optional intro"
            variant="subtitle"
            multiline
            ariaLabel="Bullets intro"
          />
          <ul className="block-preview-bullets">
            {block.bullets.map((bullet, i) => (
              <li key={i} className="block-preview-row">
                <EditableText
                  value={bullet}
                  onChange={(next) => {
                    const bullets = [...block.bullets];
                    bullets[i] = next;
                    onChange({ ...block, bullets });
                  }}
                  placeholder="Bullet point"
                  variant="body"
                  className="flex-1"
                  ariaLabel={`Bullet ${i + 1}`}
                />
                {block.bullets.length > 1 ? (
                  <BlockRemoveLine
                    onClick={() =>
                      onChange({
                        ...block,
                        bullets: block.bullets.filter((_, j) => j !== i),
                      })
                    }
                  />
                ) : null}
              </li>
            ))}
          </ul>
          <BlockAddLine onClick={() => onChange({ ...block, bullets: [...block.bullets, ""] })}>
            + Add bullet
          </BlockAddLine>
        </div>
      );
    case "richText":
      return (
        <div className="block-preview">
          <EditableText
            value={block.title ?? ""}
            onChange={(title) => onChange({ ...block, title })}
            placeholder="Optional heading"
            variant="title"
            ariaLabel="Rich text heading"
          />
          <LexicalEditor
            key={block.id}
            initialState={block.lexicalState}
            onChange={(state) =>
              onChange({
                ...block,
                lexicalState: state as unknown as Record<string, unknown>,
              })
            }
          />
        </div>
      );
    case "image":
      return (
        <div className="block-preview">
          <div className="block-preview-image">
            {block.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={block.url} alt={block.alt || "Preview"} />
            ) : (
              <p className="block-preview-image-empty">
                {onPickImage ? (
                  <button type="button" className="block-pick-image" onClick={onPickImage}>
                    Click to choose an image
                  </button>
                ) : (
                  "No image"
                )}
              </p>
            )}
          </div>
          {block.url && onPickImage ? (
            <button type="button" className="block-pick-image" onClick={onPickImage}>
              Replace image
            </button>
          ) : null}
          <EditableText
            value={block.alt}
            onChange={(alt) => onChange({ ...block, alt })}
            placeholder="Alt text (accessibility)"
            variant="body"
            ariaLabel="Image alt text"
          />
          <EditableText
            value={block.url ?? ""}
            onChange={(url) => onChange({ ...block, url })}
            placeholder="Or paste image URL"
            variant="link"
            ariaLabel="Image URL"
          />
        </div>
      );
    case "cta":
      return (
        <div className="block-preview-cta">
          <EditableText
            value={block.title}
            onChange={(title) => onChange({ ...block, title })}
            placeholder="CTA title"
            variant="title"
            ariaLabel="CTA title"
          />
          <EditableText
            value={block.body}
            onChange={(body) => onChange({ ...block, body })}
            placeholder="Supporting copy"
            variant="body"
            multiline
            ariaLabel="CTA body"
          />
          <span className="block-preview-cta-btn">
            <EditableText
              value={block.buttonLabel}
              onChange={(buttonLabel) => onChange({ ...block, buttonLabel })}
              placeholder="Button"
              variant="inline"
              ariaLabel="Button label"
            />
          </span>
          <EditableText
            value={block.buttonHref}
            onChange={(buttonHref) => onChange({ ...block, buttonHref: buttonHref || "/" })}
            placeholder="/destination"
            variant="link"
            ariaLabel="Button URL"
          />
        </div>
      );
    default:
      return null;
  }
}
