import { getPublicSiteSettings } from "@/lib/cache";
import { NATURE_IMAGES } from "@/lib/content/images";
import { getSiteUrl } from "@/lib/payments/site-url";

function toAbsolute(src: string) {
  const trimmed = src.trim();
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  const base = getSiteUrl();
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export function assetContentType(url: string) {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  if (path.endsWith(".svg") || url.startsWith("data:image/svg")) {
    return "image/svg+xml";
  }
  if (path.endsWith(".ico")) {
    return "image/x-icon";
  }
  if (path.endsWith(".webp")) {
    return "image/webp";
  }
  if (path.endsWith(".gif")) {
    return "image/gif";
  }
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  return "image/png";
}

export function isRasterImageUrl(url: string) {
  const path = url.split("?")[0]?.toLowerCase() ?? "";
  return !path.endsWith(".svg") && !url.startsWith("data:image/svg");
}

export function pickOgImage(image?: string | null, logoUrl?: string | null) {
  const candidates = [image, logoUrl, NATURE_IMAGES.canopy].filter(
    (value): value is string => Boolean(value),
  );
  const raster = candidates.find((value) => isRasterImageUrl(value));
  return toAbsolute(raster || candidates[0] || NATURE_IMAGES.canopy);
}

export async function getSiteIconUrl() {
  const settings = await getPublicSiteSettings();
  const icon = settings.favicon_url || settings.logo_url;
  return icon ? toAbsolute(icon) : null;
}

export async function getSiteOgImageUrl() {
  const settings = await getPublicSiteSettings();
  return pickOgImage(settings.logo_url, settings.logo_url);
}
