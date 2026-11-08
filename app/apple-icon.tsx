import { ImageResponse } from "next/og";
import { getSiteIconUrl, isRasterImageUrl } from "@/lib/site-assets";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const icon = await getSiteIconUrl();
  if (icon && isRasterImageUrl(icon)) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            background: "#2f5d3a",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={icon} alt="" width={180} height={180} style={{ objectFit: "cover" }} />
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2f5d3a",
          color: "#c5e1a5",
          fontSize: 96,
          fontWeight: 700,
        }}
      >
        1
      </div>
    ),
    { ...size },
  );
}
