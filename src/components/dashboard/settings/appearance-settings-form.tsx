"use client";

import { THEME_PRESET_LIST } from "@/lib/theme/presets";
import {
  BORDER_STYLES,
  BUTTON_SHAPES,
  CONTENT_WIDTHS,
  FONT_SCALES,
  RADIUS_STYLES,
  SHADOW_STYLES,
} from "@/lib/theme/types";
import { useSiteAppearance } from "@/components/theme/site-appearance-provider";

const labelFor = {
  border: {
    thin: "Thin (1px)",
    medium: "Medium (1.5px)",
    thick: "Thick (2px)",
  },
  radius: {
    sharp: "Sharp",
    soft: "Soft",
    rounded: "Rounded",
    editorial: "Editorial (large)",
  },
  shadow: {
    none: "None",
    soft: "Soft",
    elevated: "Elevated",
  },
  fontScale: {
    compact: "Compact",
    default: "Default",
    comfortable: "Comfortable",
  },
  contentWidth: {
    narrow: "Narrow (960px)",
    default: "Default (1200px)",
    wide: "Wide (1400px)",
  },
  buttonShape: {
    pill: "Pill",
    rounded: "Rounded",
  },
} as const;

export function AppearanceSettingsForm() {
  const { appearance, patchAppearance, resetAppearance } = useSiteAppearance();

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <header>
          <h2 className="text-lg font-semibold text-[var(--theme-ink)]">
            Color palette
          </h2>
          <p className="mt-1 text-sm text-[var(--theme-muted)]">
            Names describe the colors, not a marketing template. Changes apply
            site-wide immediately.
          </p>
        </header>
        <ul className="grid gap-3 sm:grid-cols-2">
          {THEME_PRESET_LIST.map((preset) => {
            const selected = appearance.presetId === preset.id;
            return (
              <li key={preset.id}>
                <button
                  type="button"
                  onClick={() => patchAppearance({ presetId: preset.id })}
                  className="w-full rounded-[var(--theme-radius-md)] border p-4 text-left transition-shadow"
                  style={{
                    borderWidth: "var(--theme-border-width)",
                    borderColor: selected
                      ? "var(--theme-primary)"
                      : "var(--theme-line-strong)",
                    background: selected
                      ? "var(--theme-surface)"
                      : "var(--theme-paper)",
                    boxShadow: selected ? "var(--theme-shadow-sm)" : "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-[var(--theme-ink)]">
                      {preset.label}
                    </span>
                    {selected ? (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{
                          background: "var(--theme-primary)",
                          color: "var(--theme-paper)",
                        }}
                      >
                        Active
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-[var(--theme-muted)]">
                    {preset.description}
                  </p>
                  <div className="mt-3 flex gap-1.5" aria-hidden="true">
                    {preset.swatches.map((hex) => (
                      <span
                        key={hex}
                        className="h-6 w-6 rounded-full border"
                        style={{
                          background: hex,
                          borderColor: "var(--theme-line)",
                        }}
                      />
                    ))}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <FieldGroup
          title="Borders"
          description="Default stroke for cards, inputs, and dividers."
        >
          <SelectRow
            value={appearance.border}
            options={BORDER_STYLES}
            labels={labelFor.border}
            onChange={(border) => patchAppearance({ border })}
          />
        </FieldGroup>

        <FieldGroup
          title="Corner radius"
          description="Global radius scale for surfaces and panels."
        >
          <SelectRow
            value={appearance.radius}
            options={RADIUS_STYLES}
            labels={labelFor.radius}
            onChange={(radius) => patchAppearance({ radius })}
          />
        </FieldGroup>

        <FieldGroup
          title="Shadows"
          description="Depth for cards and floating elements."
        >
          <SelectRow
            value={appearance.shadow}
            options={SHADOW_STYLES}
            labels={labelFor.shadow}
            onChange={(shadow) => patchAppearance({ shadow })}
          />
        </FieldGroup>

        <FieldGroup
          title="Button shape"
          description="Primary and secondary button corners."
        >
          <SelectRow
            value={appearance.buttonShape}
            options={BUTTON_SHAPES}
            labels={labelFor.buttonShape}
            onChange={(buttonShape) => patchAppearance({ buttonShape })}
          />
        </FieldGroup>

        <FieldGroup
          title="Base font size"
          description="Scales body copy across public pages and dashboard."
        >
          <SelectRow
            value={appearance.fontScale}
            options={FONT_SCALES}
            labels={labelFor.fontScale}
            onChange={(fontScale) => patchAppearance({ fontScale })}
          />
        </FieldGroup>

        <FieldGroup
          title="Content width"
          description="Max width for marketing and app shells."
        >
          <SelectRow
            value={appearance.contentWidth}
            options={CONTENT_WIDTHS}
            labels={labelFor.contentWidth}
            onChange={(contentWidth) => patchAppearance({ contentWidth })}
          />
        </FieldGroup>
      </section>

      <section
        className="rounded-[var(--theme-radius-lg)] border p-6"
        style={{
          borderWidth: "var(--theme-border-width)",
          borderColor: "var(--theme-line-strong)",
          background: "var(--theme-surface)",
          boxShadow: "var(--theme-shadow-md)",
        }}
      >
        <h2 className="text-lg font-semibold text-[var(--theme-ink)]">Preview</h2>
        <p className="mt-2 max-w-lg text-sm text-[var(--theme-muted)]">
          Sample components using the current palette and geometry tokens.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span
            className="inline-flex h-11 items-center px-5 text-sm font-semibold text-white"
            style={{
              borderRadius: "var(--theme-radius-button)",
              background: "var(--theme-primary-deep)",
            }}
          >
            Primary action
          </span>
          <span
            className="inline-flex h-11 items-center px-5 text-sm font-semibold"
            style={{
              borderRadius: "var(--theme-radius-button)",
              borderWidth: "var(--theme-border-width)",
              borderColor: "var(--theme-primary-deep)",
              color: "var(--theme-primary-deep)",
            }}
          >
            Outline
          </span>
          <span
            className="inline-flex h-11 items-center px-5 text-sm font-semibold text-[var(--theme-ink)]"
            style={{
              borderRadius: "var(--theme-radius-button)",
              background: "var(--theme-accent)",
              color: "var(--theme-paper)",
            }}
          >
            Accent
          </span>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 border-t pt-6"
        style={{ borderColor: "var(--theme-line)" }}
      >
        <button
          type="button"
          onClick={resetAppearance}
          className="text-sm font-semibold text-[var(--theme-muted)] underline-offset-2 hover:underline"
        >
          Reset to defaults (Harvest & Teal)
        </button>
      </div>
    </div>
  );
}

function FieldGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[var(--theme-ink)]">{title}</h2>
      <p className="mt-1 text-xs text-[var(--theme-muted)]">{description}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SelectRow<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className="px-3 py-2 text-xs font-semibold transition-colors"
            style={{
              borderRadius: "var(--theme-radius-sm)",
              borderWidth: "var(--theme-border-width)",
              borderColor: active
                ? "var(--theme-primary)"
                : "var(--theme-line-strong)",
              background: active ? "var(--theme-primary)" : "var(--theme-paper)",
              color: active ? "var(--theme-paper)" : "var(--theme-ink)",
            }}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}
