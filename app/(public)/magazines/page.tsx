import Link from "next/link";
import { EmptyState } from "@/components/public/empty-state";
import { NatureImage } from "@/components/public/nature-image";
import { PageHero } from "@/components/public/page-hero";
import { RichHtml } from "@/components/public/rich-html";
import { getPageContent, getPublishedMagazines } from "@/lib/content/public";
import { localizePage } from "@/lib/content/localize";
import { localizeHref } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatDate } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/content/metadata";

export async function generateMetadata() {
  return pageMetadata("magazines");
}

export default async function MagazinesPage() {
  const { locale, dict } = await getRequestDictionary();
  const [page, magazines] = await Promise.all([
    getPageContent("magazines"),
    getPublishedMagazines(),
  ]);
  const copy = localizePage(locale, page);

  return (
    <>
      <PageHero
        eyebrow={dict.magazines.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        body={copy.body}
      />
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        {magazines.length === 0 ? (
          <EmptyState message={dict.magazines.empty} />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {magazines.map((magazine) => {
              const title = pickLocalized(locale, magazine.title, magazine.title_en);
              return (
                <Link
                  key={magazine.id}
                  href={localizeHref(locale, `/magazines/${magazine.slug}`)}
                  className="group overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <NatureImage
                    src={magazine.cover_image_url}
                    alt={title}
                    className="aspect-[3/4]"
                  />
                  <div className="space-y-2 p-5">
                    {magazine.issue_date ? (
                      <p className="text-xs text-muted-foreground">
                        {dict.magazines.issue} · {formatDate(locale, magazine.issue_date)}
                      </p>
                    ) : null}
                    <h2 className="font-heading text-xl group-hover:text-primary">
                      {title}
                    </h2>
                    <RichHtml
                      className="line-clamp-3 text-sm leading-7 text-muted-foreground"
                      html={pickLocalized(locale, magazine.description, magazine.description_en)}
                    />
                    <p className="text-sm font-medium text-primary">
                      {dict.actions.readOnline}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
