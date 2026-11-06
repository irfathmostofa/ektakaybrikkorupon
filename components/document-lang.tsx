"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { defaultLocale, isEnglishPath } from "@/lib/i18n/config";

export function DocumentLang() {
  const pathname = usePathname() || "/";
  const locale = isEnglishPath(pathname) ? "en" : defaultLocale;

  useLayoutEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
