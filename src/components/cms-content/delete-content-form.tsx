"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { appOutlineButton } from "@/lib/cms/surface";
import { cn } from "@/lib/utils";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        appOutlineButton,
        "gap-1.5 text-[#a02b2b] disabled:opacity-60",
      )}
    >
      <Trash2 className="size-3.5" />
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export function DeleteContentForm({
  action,
  id,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Delete “${label}”? This removes it from the site and cannot be undone.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <DeleteButton />
    </form>
  );
}
