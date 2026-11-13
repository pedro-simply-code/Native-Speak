import { Field, StudioInput } from "@/components/studio/ui";
import {
  contentPublicPath,
  contentSlugPrefix,
  type ContentKindName,
} from "@/lib/cms/content";

export function ContentFormHeader({
  title = "",
  slug = "",
  kind = "page",
  isHomepage = false,
}: {
  title?: string;
  slug?: string;
  kind?: ContentKindName;
  isHomepage?: boolean;
}) {
  const prefix = contentSlugPrefix(kind);
  const publicPath =
    kind === "page"
      ? isHomepage
        ? "/"
        : contentPublicPath("page", slug || "your-slug", false)
      : contentPublicPath("post", slug || "your-slug");

  return (
    <>
      <Field label="Title">
        <StudioInput
          name="title"
          defaultValue={title}
          required
          placeholder="Page or post title"
          className="focus:border-sc-accent rounded-none border-0 border-b border-[#15130f]/20 bg-transparent px-0 py-1 text-lg font-semibold tracking-tight whitespace-nowrap shadow-none ring-0 focus:shadow-none focus:ring-0"
        />
      </Field>

      <div className="mt-5 pt-1">
        <Field
          label="Slug"
          hint={
            kind === "page"
              ? "Pages publish at /{slug}. Use “Use as homepage” in Publishing for /."
              : "Posts publish under /blog/{slug}."
          }
        >
          {kind === "page" && isHomepage ? (
            <>
              <p className="text-sm text-[#57524a]">
                Public URL:{" "}
                <span className="font-mono font-semibold text-[#15130f]">/</span>
              </p>
              <input type="hidden" name="slug" value={slug || "home"} />
            </>
          ) : (
            <div className="flex w-full min-w-0 items-center gap-2 text-sm text-[#6f6a60]">
              <span className="shrink-0 font-mono text-xs">{prefix}</span>
              <StudioInput
                name="slug"
                defaultValue={slug}
                placeholder={kind === "page" ? "contact" : "post-slug"}
                className="min-w-0 flex-1 font-mono text-sm"
              />
            </div>
          )}
          <p className="mt-2 text-xs text-[#6f6a60]">
            Preview:{" "}
            <span className="font-mono text-[#15130f]">{publicPath}</span>
          </p>
        </Field>
      </div>
    </>
  );
}
