import type { MessageTree } from "@/lib/i18n/messages";

type Params = Record<string, string | number>;

function getPath(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function createTranslator(messages: MessageTree) {
  return function t(key: string, params?: Params): string {
    const template = getPath(messages, key);
    if (!template) return key;
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (_, k: string) => {
      const v = params[k];
      return v === undefined ? `{${k}}` : String(v);
    });
  };
}

export type TranslateFn = ReturnType<typeof createTranslator>;
