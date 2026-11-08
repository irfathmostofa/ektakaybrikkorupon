import { ImageResponse } from "next/og";
import { getPublicSiteSettings } from "@/lib/cache";
import { defaultLocale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { pickOgImage } from "@/lib/site-assets";

export const alt = "1 Taka Tree Plantation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const settings = await getPublicSiteSettings();
  const image = pickOgImage(settings.og_image_url, settings.logo_url);
  const name = pickLocalized(
    defaultLocale,
    settings.foundation_name,
    settings.foundation_name_en,
  );

  return new ImageResponse(
    (
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
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            width: "100%",
            padding: "48px 56px",
            background:
              "linear-gradient(to top, rgba(20,40,24,0.9), rgba(20,40,24,0.15))",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          {name}
        </div>
      </div>
    ),
    { ...size },
  );
}
