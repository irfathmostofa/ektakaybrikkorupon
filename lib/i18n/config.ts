export const locales = ["bn", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "bn";

export const localeCookieName = "NEXT_LOCALE";

export const localeNames: Record<Locale, string> = {
  bn: "বা",
  en: "EN",
};

export const localeFullNames: Record<Locale, string> = {
  bn: "বাংলা",
  en: "English",
};

export const dateLocales: Record<Locale, string> = {
  bn: "bn-BD",
  en: "en-GB",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "bn" || value === "en";
}

export function getLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function stripLocalePrefix(pathname: string) {
  if (pathname === "/en") {
    return "/";
  }
  if (pathname.startsWith("/en/")) {
    return pathname.slice(3) || "/";
  }
  return pathname || "/";
}

export function localizeHref(locale: Locale, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") {
    return normalized === "/" ? "/en" : `/en${normalized}`;
  }
  return normalized;
}

export function isEnglishPath(pathname: string) {
  return pathname === "/en" || pathname.startsWith("/en/");
}
