import { ImageResponse } from "next/og";
import { getPublicSiteSettings } from "@/lib/cache";
import { defaultLocale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { getSiteUrl } from "@/lib/payments/site-url";
import { isRasterImageUrl, pickOgImage } from "@/lib/site-assets";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const OG_HEADERS = {
  "Content-Type": OG_CONTENT_TYPE,
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

function isAllowedOgSrc(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    const siteHost = new URL(getSiteUrl()).hostname.toLowerCase();
    return (
      host === siteHost ||
      host.endsWith(".supabase.co") ||
      host.endsWith(".supabase.in") ||
      host === "images.unsplash.com"
    );
  } catch {
    return false;
  }
}

export function resolveOgSource(src: string | null | undefined, fallback: string) {
  const raw = src?.trim();
  if (!raw) {
    return fallback;
  }
  try {
    const decoded = decodeURIComponent(raw).trim();
    const absolute =
      decoded.startsWith("http://") || decoded.startsWith("https://")
        ? decoded
        : decoded.startsWith("//")
          ? `https:${decoded}`
          : `${getSiteUrl()}${decoded.startsWith("/") ? decoded : `/${decoded}`}`;
    if (!isAllowedOgSrc(absolute) || !isRasterImageUrl(absolute)) {
      return fallback;
    }
    return absolute;
  } catch {
    return fallback;
  }
}

function brandedCard(title: string, image?: string) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#1f3d27",
        color: "white",
        position: "relative",
      }}
    >
      {image ? (
        <img
          src={image}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            objectFit: "cover",
          }}
        />
      ) : null}
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          width: "100%",
          padding: "48px 56px",
          background:
            "linear-gradient(to top, rgba(20,40,24,0.92), rgba(20,40,24,0.12))",
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
    </div>
  );
}

export function createOgImageResponse(image: string | null, title: string) {
  const photo = image && isRasterImageUrl(image) ? image : null;

  return new ImageResponse(brandedCard(title, photo ?? undefined), {
    ...OG_SIZE,
    headers: OG_HEADERS,
  });
}

export async function renderOgImage(src?: string | null) {
  const settings = await getPublicSiteSettings();
  const fallback = pickOgImage(settings.og_image_url, settings.logo_url);
  const image = resolveOgSource(src, fallback);
  const name = pickLocalized(
    defaultLocale,
    settings.foundation_name,
    settings.foundation_name_en,
  );

  try {
    return createOgImageResponse(image, name);
  } catch {
    return createOgImageResponse(null, name);
  }
}

export function ogImageHeaders() {
  return OG_HEADERS;
}
