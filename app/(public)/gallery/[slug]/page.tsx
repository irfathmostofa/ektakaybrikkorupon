import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryLightbox } from "@/components/public/lightbox";
import { PageHero } from "@/components/public/page-hero";
import { getAlbumBySlug, getAlbumImages } from "@/lib/content/public";
import { localizeHref } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatDate } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getRequestDictionary()).locale;
  const album = await getAlbumBySlug(slug);
  if (!album) {
    return {};
  }
  return buildMetadata({
    title: pickLocalized(locale, album.title, album.title_en),
    description: pickLocalized(locale, album.description, album.description_en),
    path: `/gallery/${album.slug}`,
    locale,
    image: album.cover_image_url,
  });
}

function GalleryAlbumFallback() {
  return (
    <>
      <section className="relative overflow-hidden bg-mist/70">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="mt-4 h-10 max-w-xl rounded bg-muted" />
          <div className="mt-5 h-16 max-w-2xl rounded bg-muted" />
        </div>
      </section>
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-[4/3] rounded-2xl bg-muted" />
          ))}
        </div>
      </section>
    </>
  );
}

async function GalleryAlbumContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, dict } = await getRequestDictionary();
  const album = await getAlbumBySlug(slug);
  if (!album) {
    notFound();
  }
  const images = await getAlbumImages(slug);

  return (
    <>
      <PageHero
        eyebrow={formatDate(locale, album.event_date)}
        title={pickLocalized(locale, album.title, album.title_en)}
        subtitle={pickLocalized(locale, album.description, album.description_en)}
      />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href={localizeHref(locale, "/gallery")}
          className="mb-8 inline-block text-sm text-primary"
        >
          {dict.actions.backToGallery}
        </Link>
        <GalleryLightbox images={images} locale={locale} dict={dict} />
      </section>
    </>
  );
}

export default function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<GalleryAlbumFallback />}>
      <GalleryAlbumContent params={params} />
    </Suspense>
  );
}
