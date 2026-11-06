import Link from "next/link";
import { notFound } from "next/navigation";
import { NatureImage } from "@/components/public/nature-image";
import { PageHero } from "@/components/public/page-hero";
import { buttonVariants } from "@/components/ui/button";
import { getCauseBySlug } from "@/lib/content/public";
import { localizeHref } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatCurrency } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getRequestDictionary()).locale;
  const cause = await getCauseBySlug(slug);
  if (!cause) {
    return {};
  }
  return buildMetadata({
    title: pickLocalized(locale, cause.title, cause.title_en),
    description: pickLocalized(
      locale,
      cause.short_description,
      cause.short_description_en,
    ) || pickLocalized(locale, cause.description, cause.description_en),
    path: `/causes/${cause.slug}`,
    locale,
    image: cause.image_url,
  });
}

export default async function CauseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, dict } = await getRequestDictionary();
  const cause = await getCauseBySlug(slug);
  if (!cause) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={dict.causes.eyebrow}
        title={pickLocalized(locale, cause.title, cause.title_en)}
        subtitle={pickLocalized(
          locale,
          cause.short_description,
          cause.short_description_en,
        )}
      />
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr]">
        <article>
          <Link href={localizeHref(locale, "/causes")} className="text-sm text-primary">
            {dict.actions.backToCauses}
          </Link>
          <div className="mt-6">
            <NatureImage
              src={cause.image_url}
              alt={pickLocalized(locale, cause.title, cause.title_en)}
              className="aspect-[16/9]"
            />
          </div>
          <p className="mt-8 whitespace-pre-line leading-8">
            {pickLocalized(locale, cause.description, cause.description_en)}
          </p>
        </article>
        <aside className="h-fit rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">{dict.causes.raised}</p>
          <p className="mt-1 font-heading text-3xl text-primary">
            {formatCurrency(locale, Number(cause.raised_amount))}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{dict.causes.goal}</p>
          <p className="mt-1 font-heading text-xl">
            {formatCurrency(locale, Number(cause.goal_amount))}
          </p>
          <Link
            href={localizeHref(locale, `/donate?cause=${cause.slug}`)}
            className={`${buttonVariants({ size: "lg" })} mt-6 w-full`}
          >
            {dict.nav.donate}
          </Link>
        </aside>
      </section>
    </>
  );
}
