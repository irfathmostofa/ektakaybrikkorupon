import Link from "next/link";
import { EmptyState } from "@/components/public/empty-state";
import { NatureImage } from "@/components/public/nature-image";
import { PageHero } from "@/components/public/page-hero";
import { getPublishedCauses } from "@/lib/content/public";
import { localizeHref } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatCurrency } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, dict } = await getRequestDictionary();
  return buildMetadata({
    title: dict.nav.causes,
    description: dict.causes.eyebrow,
    path: "/causes",
    locale,
  });
}

export default async function CausesPage() {
  const { locale, dict } = await getRequestDictionary();
  const causes = await getPublishedCauses();

  return (
    <>
      <PageHero
        eyebrow={dict.causes.eyebrow}
        title={dict.nav.causes}
        subtitle={dict.brand.conservation}
      />
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        {causes.length === 0 ? (
          <EmptyState message={dict.causes.empty} />
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {causes.map((cause) => {
              const goal = Number(cause.goal_amount) || 0;
              const raised = Number(cause.raised_amount) || 0;
              const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
              return (
                <Link
                  key={cause.id}
                  href={localizeHref(locale, `/causes/${cause.slug}`)}
                  className="overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <NatureImage
                    src={cause.image_url}
                    alt={pickLocalized(locale, cause.title, cause.title_en)}
                  />
                  <div className="space-y-3 p-5">
                    <h2 className="font-heading text-xl">
                      {pickLocalized(locale, cause.title, cause.title_en)}
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {pickLocalized(
                        locale,
                        cause.short_description,
                        cause.short_description_en,
                      )}
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dict.causes.raised} {formatCurrency(locale, raised)} ·{" "}
                      {dict.causes.goal} {formatCurrency(locale, goal)}
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
