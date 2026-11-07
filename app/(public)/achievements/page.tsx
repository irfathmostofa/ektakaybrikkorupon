import { CountUp } from "@/components/public/count-up";
import { EmptyState } from "@/components/public/empty-state";
import { NatureImage } from "@/components/public/nature-image";
import { PageHero } from "@/components/public/page-hero";
import { RichHtml } from "@/components/public/rich-html";
import { getAchievements, getPageContent } from "@/lib/content/public";
import { localizePage } from "@/lib/content/localize";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatDate } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/content/metadata";

export async function generateMetadata() {
  return pageMetadata("achievements");
}

export default async function AchievementsPage() {
  const { locale, dict } = await getRequestDictionary();
  const [page, achievements] = await Promise.all([
    getPageContent("achievements"),
    getAchievements(),
  ]);
  const copy = localizePage(locale, page);

  return (
    <>
      <PageHero
        eyebrow={dict.achievements.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        body={copy.body}
      />
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        {achievements.length === 0 ? (
          <EmptyState message={dict.achievements.empty} />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {achievements.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-border bg-card px-5 py-6"
                >
                  <p className="font-heading text-4xl text-primary">
                    {item.metric_value != null ? (
                      <CountUp value={item.metric_value} locale={locale} />
                    ) : (
                      "—"
                    )}
                  </p>
                  <p className="mt-2 text-sm text-soil">
                    {pickLocalized(locale, item.metric_label, item.metric_label_en)}
                  </p>
                </article>
              ))}
            </div>
            <ol className="mt-16 space-y-8 border-l-2 border-primary/25 pl-8">
              {achievements.map((item) => (
                <li key={`${item.id}-path`} className="relative">
                  <span className="absolute top-1.5 -left-[2.2rem] size-3 rounded-full bg-sunlit" />
                  <p className="text-xs text-muted-foreground">
                    {formatDate(locale, item.achieved_on)}
                  </p>
                  <h2 className="mt-1 font-heading text-2xl">
                    {pickLocalized(locale, item.title, item.title_en)}
                  </h2>
                  <RichHtml
                    className="mt-2 max-w-2xl text-muted-foreground"
                    html={pickLocalized(locale, item.description, item.description_en)}
                  />
                  {item.image_url ? (
                    <NatureImage
                      src={item.image_url}
                      alt={pickLocalized(locale, item.title, item.title_en)}
                      className="mt-4 max-w-md"
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </>
  );
}
