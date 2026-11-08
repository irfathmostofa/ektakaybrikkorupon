import { ImageResponse } from "next/og";
import { getSiteIconUrl, isRasterImageUrl } from "@/lib/site-assets";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
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
          <img src={icon} alt="" width={32} height={32} style={{ objectFit: "cover" }} />
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
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        1
      </div>
    ),
    { ...size },
  );
}
