import type { Metadata } from "next";
import { getPublicSiteSettings } from "@/lib/cache";
import { NATURE_IMAGES } from "@/lib/content/images";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/server";
import { getSiteUrl } from "@/lib/payments/site-url";
import { stripHtml } from "@/lib/sanitize-html";
import type { PublicSiteSettings } from "@/lib/types/database";

export const OG_LOCALE: Record<Locale, string> = {
  bn: "bn_BD",
  en: "en_GB",
};

export function absoluteUrl(path = "/") {
  const base = getSiteUrl();
  if (!path || path === "/") {
    return base;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absoluteAsset(src: string) {
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:")
  ) {
    return src;
  }
  return absoluteUrl(src);
}

export function languageAlternates(path: string) {
  const bn = absoluteUrl(localizeHref("bn", path));
  const en = absoluteUrl(localizeHref("en", path));
  return {
    bn,
    "bn-BD": bn,
    en,
    "en-GB": en,
    "x-default": bn,
  };
}

export function sitemapLanguageAlternates(path: string) {
  const bn = absoluteUrl(localizeHref("bn", path));
  const en = absoluteUrl(localizeHref("en", path));
  return {
    bn,
    en,
    "x-default": bn,
  };
}

export function clipDescription(text: string | null | undefined, max = 160) {
  const value = stripHtml(text).replace(/\s+/g, " ").trim();
  if (!value) {
    return undefined;
  }
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max - 1).trimEnd()}...`;
}

type BuildMetadataInput = {
  title: string;
  description?: string | null;
  path: string;
  locale?: Locale;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  noIndex?: boolean;
};

export async function buildMetadata({
  title,
  description,
  path,
  locale: localeArg,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: BuildMetadataInput): Promise<Metadata> {
  const [settings, locale] = await Promise.all([
    getPublicSiteSettings(),
    localeArg ? Promise.resolve(localeArg) : getRequestLocale(),
  ]);
  const siteName = pickLocalized(
    locale,
    settings.foundation_name,
    settings.foundation_name_en,
  );
  const resolvedDescription =
    clipDescription(description) ||
    clipDescription(
      pickLocalized(locale, settings.meta_description, settings.meta_description_en),
    );
  const canonicalPath = localizeHref(locale, path);
  const url = absoluteUrl(canonicalPath);
  const imageSrc = image || settings.logo_url || NATURE_IMAGES.canopy;
  const imageUrl = absoluteAsset(imageSrc);
  const ogLocale = OG_LOCALE[locale];
  const alternateLocale = locale === "bn" ? "en_GB" : "bn_BD";

  return {
    title,
    description: resolvedDescription,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type,
      locale: ogLocale,
      alternateLocale: [alternateLocale],
      url,
      siteName,
      title,
      description: resolvedDescription,
      images: [{ url: imageUrl, alt: title }],
      ...(type === "article"
        ? {
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: resolvedDescription,
      images: [imageUrl],
    },
  };
}

export function noIndexMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}

export function organizationJsonLd(locale: Locale, settings: PublicSiteSettings) {
  const name = pickLocalized(
    locale,
    settings.foundation_name,
    settings.foundation_name_en,
  );
  const description = pickLocalized(
    locale,
    settings.meta_description,
    settings.meta_description_en,
  );
  const sameAs = Object.values(settings.social_links ?? {}).filter(
    (value): value is string => Boolean(value),
  );
  const alternateName =
    locale === "bn" ? settings.foundation_name_en : settings.foundation_name;
  const locality = pickLocalized(locale, settings.address, settings.address_en);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NGO",
        name,
        url: absoluteUrl("/"),
        ...(alternateName ? { alternateName } : {}),
        ...(settings.logo_url ? { logo: absoluteAsset(settings.logo_url) } : {}),
        ...(settings.contact_email ? { email: settings.contact_email } : {}),
        ...(settings.contact_phone ? { telephone: settings.contact_phone } : {}),
        ...(description ? { description } : {}),
        ...(locality
          ? {
              address: {
                "@type": "PostalAddress",
                addressCountry: "BD",
                addressLocality: locality,
              },
            }
          : {}),
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        name,
        url: absoluteUrl("/"),
        inLanguage: locale === "bn" ? "bn-BD" : "en-GB",
        ...(description ? { description } : {}),
      },
    ],
  };
}
