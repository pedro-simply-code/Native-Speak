import {
  Field,
  StudioSelect,
  StudioTextarea,
} from "@/components/studio/ui";
import {
  ContentPublishingOptions,
  type CurrentHomepagePreview,
} from "@/components/cms-content/content-publishing-options";
import {
  CONTENT_KINDS,
  CONTENT_KIND_LABEL,
  CONTENT_STATUSES,
  CONTENT_STATUS_LABEL,
  type ContentKindName,
  type ContentStatusName,
} from "@/lib/cms/content";

export function ContentFormSidebar({
  kind = "page",
  status = "draft",
  excerpt = "",
  entryId,
  isHomepage = false,
  showInNav = false,
  navLabel = "",
  currentHomepage = null,
  onKindChange,
  onHomepageChange,
}: {
  kind?: ContentKindName;
  status?: ContentStatusName;
  excerpt?: string;
  entryId?: string;
  isHomepage?: boolean;
  showInNav?: boolean;
  navLabel?: string;
  currentHomepage?: CurrentHomepagePreview;
  onKindChange?: (kind: ContentKindName) => void;
  onHomepageChange?: (value: boolean) => void;
}) {
  return (
    <div className="grid gap-4">
      <Field label="Type">
        <StudioSelect
          name="kind"
          defaultValue={kind}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "page" || value === "post") {
              onKindChange?.(value);
            }
          }}
        >
          {CONTENT_KINDS.map((value) => (
            <option key={value} value={value}>
              {CONTENT_KIND_LABEL[value]}
            </option>
          ))}
        </StudioSelect>
      </Field>
      <Field label="Status">
        <StudioSelect name="status" defaultValue={status}>
          {CONTENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {CONTENT_STATUS_LABEL[value]}
            </option>
          ))}
        </StudioSelect>
      </Field>
      <Field
        label="Excerpt"
        hint="Shown in the listing and used as the meta description."
      >
        <StudioTextarea
          name="excerpt"
          defaultValue={excerpt}
          className="min-h-24"
        />
      </Field>
      {kind === "page" ? (
        <ContentPublishingOptions
          key={`${entryId ?? "new"}-${kind}-${isHomepage}-${showInNav}`}
          kind={kind}
          entryId={entryId}
          defaultIsHomepage={isHomepage}
          defaultShowInNav={showInNav}
          defaultNavLabel={navLabel}
          currentHomepage={currentHomepage}
          onHomepageChange={onHomepageChange}
        />
      ) : null}
    </div>
  );
}
