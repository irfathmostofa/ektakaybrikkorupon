import { renderOgImage } from "@/lib/og-image";

export const alt = "1 Taka Tree Plantation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return renderOgImage();
}
