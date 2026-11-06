import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  getLocale,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function getRequestLocale(): Promise<Locale> {
  const headerStore = await headers();
  const fromHeader = headerStore.get("x-locale");
  if (fromHeader) {
    return getLocale(fromHeader);
  }

  const cookieStore = await cookies();
  return getLocale(cookieStore.get(localeCookieName)?.value ?? defaultLocale);
}

export async function getRequestDictionary() {
  const locale = await getRequestLocale();
  return { locale, dict: getDictionary(locale) };
}
