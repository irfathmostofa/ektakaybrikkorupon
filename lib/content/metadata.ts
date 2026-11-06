import type { Metadata } from "next";
import { getPageContent } from "@/lib/content/public";
import { localizePage } from "@/lib/content/localize";
import { getRequestLocale } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

const PAGE_PATHS: Record<string, string> = {
  home: "/",
  about: "/about",
  contact: "/contact",
  gallery: "/gallery",
  achievements: "/achievements",
  transparency: "/transparency",
  membership: "/membership",
  careers: "/careers",
};

export async function pageMetadata(pageKey: string): Promise<Metadata> {
  const locale = await getRequestLocale();
  const page = await getPageContent(pageKey);
  const copy = localizePage(locale, page);
  const path = PAGE_PATHS[pageKey] ?? `/${pageKey}`;

  return buildMetadata({
    title: copy.metaTitle || copy.title,
    description: copy.metaDescription || copy.subtitle || copy.body,
    path,
    locale,
    image: copy.heroImage,
  });
}
