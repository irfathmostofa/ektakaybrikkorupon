"use client";

import { usePathname } from "next/navigation";
import {
  localeFullNames,
  localeNames,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/config";

function switchHref(locale: Locale, path: string) {
  const params = new URLSearchParams({ locale, next: path });
  return `/locale?${params.toString()}`;
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/";
  const path = stripLocalePrefix(pathname);

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/80 px-1.5 py-1 text-xs"
      role="group"
      aria-label="Language"
    >
      {(["bn", "en"] as const).map((item) => {
        const active = item === locale;
        return (
          <a
            key={item}
            href={switchHref(item, path)}
            className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            hrefLang={item}
            lang={item}
            title={localeFullNames[item]}
            aria-label={localeFullNames[item]}
            aria-current={active ? "true" : undefined}
          >
            {localeNames[item]}
          </a>
        );
      })}
    </div>
  );
}
