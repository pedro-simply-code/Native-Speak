export type LinkFieldValue = {
  href: string;
  newTab: boolean;
  nofollow: boolean;
};

export function isExternalHref(href: string): boolean {
  const target = href.trim();
  return /^(https?:)?\/\//i.test(target) || target.startsWith("mailto:");
}

/** Build `rel` for anchors; includes security tokens when opening a new tab. */
export function buildLinkRel(options: {
  newTab: boolean;
  nofollow: boolean;
}): null | string {
  const parts: string[] = [];
  if (options.newTab) {
    parts.push("noopener", "noreferrer");
  }
  if (options.nofollow) {
    parts.push("nofollow");
  }
  return parts.length > 0 ? parts.join(" ") : null;
}

export function linkRelHasNofollow(rel: null | string | undefined): boolean {
  if (!rel) return false;
  return rel.split(/\s+/).some((token) => token.toLowerCase() === "nofollow");
}

export const EMPTY_LINK_FIELD: LinkFieldValue = {
  href: "",
  newTab: false,
  nofollow: false,
};
