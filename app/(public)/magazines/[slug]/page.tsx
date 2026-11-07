import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/public/page-hero";
import { PdfReader } from "@/components/public/pdf-reader";
import { RichHtml } from "@/components/public/rich-html";
import { getMagazineBySlug } from "@/lib/content/public";
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
  const magazine = await getMagazineBySlug(slug);
  if (!magazine) {
    return {};
  }
  return buildMetadata({
    title: pickLocalized(locale, magazine.title, magazine.title_en),
    description: pickLocalized(locale, magazine.description, magazine.description_en),
    path: `/magazines/${magazine.slug}`,
    locale,
    image: magazine.cover_image_url,
  });
}

export default async function MagazineIssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, dict } = await getRequestDictionary();
  const magazine = await getMagazineBySlug(slug);
  if (!magazine) {
    notFound();
  }

  const title = pickLocalized(locale, magazine.title, magazine.title_en);

  return (
    <>
      <PageHero
        eyebrow={
          magazine.issue_date
            ? `${dict.magazines.issue} · ${formatDate(locale, magazine.issue_date)}`
            : dict.magazines.eyebrow
        }
        title={title}
        body={dict.magazines.downloadHint}
      />
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <Link
          href={localizeHref(locale, "/magazines")}
          className="mb-8 inline-block text-sm text-primary"
        >
          {dict.actions.backToMagazines}
        </Link>
        <RichHtml
          className="prose mb-8 max-w-none text-base leading-8 text-muted-foreground"
          html={pickLocalized(locale, magazine.description, magazine.description_en)}
        />
        <h2 className="mb-4 font-heading text-2xl">{dict.magazines.readTitle}</h2>
        <PdfReader
          src={magazine.pdf_url}
          title={title}
          downloadHref={`/api/magazines/${magazine.slug}/download`}
          downloadLabel={dict.actions.downloadPdf}
        />
      </section>
    </>
  );
}
