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

export default async function GalleryAlbumPage({
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
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
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
