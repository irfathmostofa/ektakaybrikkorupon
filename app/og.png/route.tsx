import { renderOgImage } from "@/lib/og-image";

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src");
  return renderOgImage(src);
}
