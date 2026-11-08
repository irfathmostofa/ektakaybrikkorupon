import { NextResponse } from "next/server";
import { assetContentType, getSiteIconUrl } from "@/lib/site-assets";

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#2f5d3a"/>
  <circle cx="16" cy="13" r="6" fill="#c5e1a5"/>
  <rect x="14.5" y="18" width="3" height="8" rx="1" fill="#8d6e63"/>
</svg>`;

export async function GET() {
  const icon = await getSiteIconUrl();
  if (icon) {
    try {
      const source = await fetch(icon, { cache: "force-cache" });
      if (source.ok && source.body) {
        return new NextResponse(source.body, {
          headers: {
            "Content-Type": source.headers.get("content-type") || assetContentType(icon),
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      }
    } catch {
      // Fall through to the branded SVG.
    }
  }

  return new NextResponse(FALLBACK_SVG, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
