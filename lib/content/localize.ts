import type { Locale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import type { PageContent } from "@/lib/types/database";

export function localizePage(locale: Locale, page: PageContent) {
  return {
    title: pickLocalized(locale, page.title, page.title_en),
    subtitle: pickLocalized(locale, page.subtitle, page.subtitle_en),
    body: pickLocalized(locale, page.body, page.body_en),
    metaTitle: pickLocalized(locale, page.meta_title, page.meta_title_en),
    metaDescription: pickLocalized(
      locale,
      page.meta_description,
      page.meta_description_en,
    ),
    heroImage: page.hero_image_url,
  };
}
