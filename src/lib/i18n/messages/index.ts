import type { AppLocale } from "@/lib/i18n/config";
import { en, type MessageTree } from "@/lib/i18n/messages/en";
import { es } from "@/lib/i18n/messages/es";

const catalog: Record<AppLocale, MessageTree> = {
  en: en as MessageTree,
  es: es as MessageTree,
};

export function getMessages(locale: AppLocale): MessageTree {
  return catalog[locale] ?? catalog.en;
}

export type { MessageTree };
