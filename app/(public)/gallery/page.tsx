import Link from "next/link";
import { EmptyState } from "@/components/public/empty-state";
import { NatureImage } from "@/components/public/nature-image";
import { PageHero } from "@/components/public/page-hero";
import { getGalleryAlbums, getPageContent } from "@/lib/content/public";
import { localizePage } from "@/lib/content/localize";
import { localizeHref } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatDate, formatNumber } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/content/metadata";

export async function generateMetadata() {
  return pageMetadata("gallery");
}

export default async function GalleryPage() {
  const { locale, dict } = await getRequestDictionary();
  const [page, albums] = await Promise.all([
    getPageContent("gallery"),
    getGalleryAlbums(),
  ]);
  const copy = localizePage(locale, page);

  return (
    <>
      <PageHero
        eyebrow={dict.gallery.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        body={copy.body}
      />
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        {albums.length === 0 ? (
          <EmptyState message={dict.gallery.empty} />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={localizeHref(locale, `/gallery/${album.slug}`)}
                className="group"
              >
                <NatureImage
                  src={album.cover_image_url}
                  alt={pickLocalized(locale, album.title, album.title_en)}
                />
                <div className="mt-4">
                  <h2 className="font-heading text-xl group-hover:text-primary">
                    {pickLocalized(locale, album.title, album.title_en)}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(locale, album.event_date)} ·{" "}
                    {formatNumber(locale, album.image_count ?? 0)} {dict.gallery.images}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
