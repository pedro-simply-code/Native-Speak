"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, StudioInput } from "@/components/studio/ui";
import type { ContentKindName } from "@/lib/cms/content";
import { appOutlineButton, appPrimaryButtonStudio } from "@/lib/cms/surface";

export type CurrentHomepagePreview = {
  id: string;
  title: string;
  href: string;
} | null;

export function ContentPublishingOptions({
  kind,
  entryId,
  defaultIsHomepage = false,
  defaultShowInNav = false,
  defaultNavLabel = "",
  currentHomepage,
  onHomepageChange,
}: {
  kind: ContentKindName;
  entryId?: string;
  defaultIsHomepage?: boolean;
  defaultShowInNav?: boolean;
  defaultNavLabel?: string;
  currentHomepage: CurrentHomepagePreview;
  onHomepageChange?: (value: boolean) => void;
}) {
  const [isHomepage, setIsHomepage] = useState(defaultIsHomepage);
  const [showInNav, setShowInNav] = useState(defaultShowInNav);
  const [homepageDialogOpen, setHomepageDialogOpen] = useState(false);

  if (kind !== "page") {
    return null;
  }

  const otherHomepage =
    currentHomepage && currentHomepage.id !== entryId
      ? currentHomepage
      : null;

  const applyHomepage = (checked: boolean) => {
    setIsHomepage(checked);
    onHomepageChange?.(checked);
  };

  const requestHomepage = (checked: boolean) => {
    if (!checked) {
      applyHomepage(false);
      return;
    }
    if (otherHomepage) {
      setHomepageDialogOpen(true);
      return;
    }
    applyHomepage(true);
  };

  const confirmHomepage = () => {
    applyHomepage(true);
    setHomepageDialogOpen(false);
  };

  const cancelHomepage = () => {
    applyHomepage(false);
    setHomepageDialogOpen(false);
  };

  return (
    <>
      {isHomepage ? (
        <input type="hidden" name="isHomepage" value="1" />
      ) : null}
      {showInNav ? <input type="hidden" name="showInNav" value="1" /> : null}

      <div className="grid gap-4 border-t border-[#15130f]/10 pt-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="border-sc-accent/40 text-sc-accent focus:ring-sc-accent/30 mt-0.5 size-4 rounded border"
            checked={isHomepage}
            onChange={(event) => requestHomepage(event.target.checked)}
          />
          <span className="grid gap-1">
            <span className="text-sm font-semibold text-[#15130f]">
              Use as homepage
            </span>
            <span className="text-xs leading-relaxed text-[#57524a]">
              Publishes this page at <span className="font-mono">/</span> instead
              of <span className="font-mono">/{`{slug}`}</span>.
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="border-sc-accent/40 text-sc-accent focus:ring-sc-accent/30 mt-0.5 size-4 rounded border"
            checked={showInNav}
            onChange={(event) => setShowInNav(event.target.checked)}
          />
          <span className="grid gap-1">
            <span className="text-sm font-semibold text-[#15130f]">
              Show in main navigation
            </span>
            <span className="text-xs leading-relaxed text-[#57524a]">
              Adds a link to the public header. If no pages use this, the menu
              shows Home (<span className="font-mono">/</span>) only.
            </span>
          </span>
        </label>

        {showInNav ? (
          <Field
            label="Nav label"
            hint="Optional. Leave empty to use the page title."
          >
            <StudioInput
              name="navLabel"
              defaultValue={defaultNavLabel}
              placeholder="Link text in the menu"
            />
          </Field>
        ) : null}
      </div>

      <Dialog
        open={homepageDialogOpen}
        onOpenChange={(open) => {
          if (!open) cancelHomepage();
          else setHomepageDialogOpen(true);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace the current homepage?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-sm text-[#57524a]">
                <p>
                  Only one page can be the homepage. If you continue, the
                  previous homepage will be unchecked and will publish at its
                  normal URL (<span className="font-mono">/slug</span>).
                </p>
                {otherHomepage ? (
                  <p>
                    Current homepage:{" "}
                    <strong className="text-[#15130f]">
                      {otherHomepage.title}
                    </strong>
                  </p>
                ) : null}
              </div>
            </DialogDescription>
          </DialogHeader>
          {otherHomepage ? (
            <Link
              href={otherHomepage.href}
              target="_blank"
              rel="noreferrer"
              className="text-sc-accent inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
            >
              View current homepage <ExternalLink className="size-3.5" />
            </Link>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              className={appOutlineButton}
              onClick={cancelHomepage}
            >
              Keep current homepage
            </button>
            <button
              type="button"
              className={appPrimaryButtonStudio}
              onClick={confirmHomepage}
            >
              Use this page instead
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
