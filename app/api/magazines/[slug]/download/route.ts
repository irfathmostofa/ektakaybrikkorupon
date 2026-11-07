import { NextResponse } from "next/server";
import { getMagazineBySlug } from "@/lib/content/public";

function downloadName(slug: string) {
  const safe = slug.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
  return `${safe || "magazine"}.pdf`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const magazine = await getMagazineBySlug(slug);
  if (!magazine?.pdf_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const source = await fetch(magazine.pdf_url);
  if (!source.ok || !source.body) {
    return NextResponse.json({ error: "File unavailable" }, { status: 502 });
  }

  return new NextResponse(source.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${downloadName(magazine.slug)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
