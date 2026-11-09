import { CountUp } from "@/components/public/count-up";
import { NatureImage } from "@/components/public/nature-image";
import { PageHero } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { RichHtml } from "@/components/public/rich-html";
import {
  getAboutPageSections,
  getAchievements,
  getPageContent,
  getTeamMembers,
} from "@/lib/content/public";
import { localizeAboutSections } from "@/lib/content/about-sections";
import { localizePage } from "@/lib/content/localize";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { getRequestDictionary } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/content/metadata";

export async function generateMetadata() {
  return pageMetadata("about");
}

export default async function AboutPage() {
  const { locale } = await getRequestDictionary();
  const [page, sections, team, achievements] = await Promise.all([
    getPageContent("about"),
    getAboutPageSections(),
    getTeamMembers(),
    getAchievements(),
  ]);
  const copy = localizePage(locale, page);
  const about = localizeAboutSections(locale, sections);

  return (
    <>
      <PageHero
        eyebrow={about.hero.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        body={copy.body}
      />

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-16 md:grid-cols-2">
        {[about.mission, about.vision].map((section) => (
          <Reveal key={section.title}>
            <article className="h-full rounded-2xl border border-border bg-secondary/70 p-8">
              <p className="text-xs tracking-[0.2em] text-primary uppercase">
                {section.eyebrow}
              </p>
              <h2 className="mt-3 font-heading text-2xl">{section.title}</h2>
              <RichHtml
                className="mt-4 leading-8 text-foreground/80"
                html={section.body}
              />
            </article>
          </Reveal>
        ))}
      </section>

      {about.values.title || about.values.body ? (
        <section className="bg-mist/70 py-16">
          <div className="mx-auto w-full max-w-6xl px-6">
            <h2 className="font-heading text-3xl">{about.values.title}</h2>
            <RichHtml
              className="mt-5 max-w-3xl leading-8"
              html={about.values.body}
            />
          </div>
        </section>
      ) : null}

      {about.story.title || about.story.body ? (
        <section className="mx-auto grid w-full max-w-6xl items-center gap-8 overflow-x-hidden px-4 py-12 sm:px-6 sm:py-16 md:grid-cols-2 md:gap-12">
          <div className="min-w-0 w-full">
            <NatureImage
              src={about.story.imageUrl}
              alt={about.story.title}
              className="w-full max-w-full"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs tracking-[0.2em] text-primary uppercase">
              {about.story.eyebrow}
            </p>
            <h2 className="mt-3 font-heading text-2xl break-words sm:text-3xl">
              {about.story.title}
            </h2>
            <RichHtml
              className="mt-5 text-[0.95rem] leading-7 break-words text-foreground/85 sm:text-base sm:leading-8"
              html={about.story.body}
            />
          </div>
        </section>
      ) : null}

      {about.timeline.title || about.timeline.body ? (
        <section className="bg-card py-16">
          <div className="mx-auto w-full max-w-3xl px-6">
            <h2 className="font-heading text-3xl">{about.timeline.title}</h2>
            <div className="relative mt-8 border-l-2 border-primary/30 pl-6">
              <span className="absolute top-1.5 -left-[0.42rem] size-3 rounded-full bg-primary" />
              <RichHtml className="leading-7" html={about.timeline.body} />
            </div>
          </div>
        </section>
      ) : null}

      {about.extra.title || about.extra.body ? (
        <section className="mx-auto w-full max-w-6xl px-6 py-12">
          <h2 className="font-heading text-2xl">{about.extra.title}</h2>
          <RichHtml
            className="mt-4 max-w-3xl leading-8"
            html={about.extra.body}
          />
        </section>
      ) : null}

      <section className="bg-mist/80 py-16">
        <div className="mx-auto w-full max-w-6xl px-6">
          <h2 className="font-heading text-3xl">{about.impact.heading}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {achievements.slice(0, 3).map((item) => (
              <article key={item.id} className="rounded-2xl bg-card p-6">
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
        </div>
      </section>

      <section className="overflow-x-hidden py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl">{about.team.heading}</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <article
                key={member.id}
                className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card"
              >
                <NatureImage
                  src={member.photo_url}
                  alt={pickLocalized(locale, member.full_name, member.full_name_en)}
                  className="aspect-[4/5] rounded-none"
                  imageClassName="object-top"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-5">
                  <h3 className="font-heading text-lg break-words">
                    {pickLocalized(locale, member.full_name, member.full_name_en)}
                  </h3>
                  <p className="mt-1 text-sm break-words text-primary">
                    {pickLocalized(locale, member.role_title, member.role_title_en)}
                  </p>
                  <RichHtml
                    className="mt-2 text-sm leading-6 break-words text-muted-foreground"
                    html={pickLocalized(locale, member.bio, member.bio_en)}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
