import type { Locale } from "@/lib/i18n/config";
import bn from "@/messages/bn.json";
import en from "@/messages/en.json";

export type Dictionary = typeof bn;

const dictionaries: Record<Locale, Dictionary> = {
  bn,
  en: en as Dictionary,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.bn;
}

export function pickLocalized(
  locale: Locale,
  bangla: string | null | undefined,
  english: string | null | undefined,
) {
  if (locale === "en") {
    const value = english?.trim();
    if (value) {
      return value;
    }
  }
  return bangla?.trim() || english?.trim() || "";
}
