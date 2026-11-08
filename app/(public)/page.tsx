import Link from "next/link";
import { CountUp } from "@/components/public/count-up";
import { NatureImage } from "@/components/public/nature-image";
import { Reveal } from "@/components/public/reveal";
import { RichHtml } from "@/components/public/rich-html";
import { TreeJourney } from "@/components/public/tree-journey";
import { buttonVariants } from "@/components/ui/button";
import { NATURE_IMAGES } from "@/lib/content/images";
import {
  getFinanceEntries,
  getGalleryAlbums,
  getHomeSections,
  getPageContent,
  getPublishedCauses,
} from "@/lib/content/public";
import { localizeHomeSections } from "@/lib/content/home-sections";
import { localizePage } from "@/lib/content/localize";
import { localizeHref } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatCurrency } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/content/metadata";

export async function generateMetadata() {
  return pageMetadata("home");
}

export default async function HomePage() {
  const { locale, dict } = await getRequestDictionary();
  const [page, sections, causes, albums, finance] = await Promise.all([
    getPageContent("home"),
    getHomeSections(),
    getPublishedCauses(),
    getGalleryAlbums(),
    getFinanceEntries(),
  ]);
  const copy = localizePage(locale, page);
  const home = localizeHomeSections(locale, sections);
  const featured = causes.filter((item) => item.featured).slice(0, 3);
  const recentAlbums = albums.slice(0, 3);
  const collected = finance
    .filter((item) => item.kind === "collection")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const spent = finance
    .filter((item) => item.kind === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <>
      <TreeJourney
        locale={locale}
        dict={dict}
        hero={
          <div className="relative mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center px-6 py-10 text-center">
            <Reveal>
              <p className="text-xs font-medium tracking-[0.24em] text-primary uppercase">
                {home.hero.eyebrow}
              </p>
              <h1 className="mx-auto mt-4 max-w-3xl font-heading text-3xl leading-tight text-canopy text-balance sm:text-4xl md:text-6xl">
                {copy.title}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-foreground/80 md:text-lg md:leading-8">
                {copy.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href={localizeHref(locale, "/donate")}
                  className={buttonVariants({ size: "lg" })}
                >
                  {home.hero.donateLabel}
                </Link>
                <Link
                  href={localizeHref(locale, "/about")}
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  {home.hero.workLabel}
                </Link>
              </div>
              <p className="tj-hint">
                <span>{dict.treeJourney.scrollHint}</span>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </p>
            </Reveal>
          </div>
        }
      />

      <section className="bg-mist/80 py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
              {home.impact.heading}
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {home.impact.stats.map((item, index) => (
              <Reveal key={`${item.label}-${index}`} delay={index * 0.08}>
                <article className="rounded-2xl border border-border bg-card px-5 py-6">
                  <p className="font-heading text-3xl text-primary md:text-4xl">
                    {item.numeric != null ? (
                      <CountUp value={item.numeric} locale={locale} suffix={item.suffix} />
                    ) : (
                      item.value
                    )}
                  </p>
                  <p className="mt-2 text-sm text-soil">{item.label}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-x-hidden py-12 sm:py-16 md:py-20">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 sm:px-6 md:grid-cols-2 md:gap-12">
          <div className="min-w-0 w-full">
            <NatureImage
              src={home.story.imageUrl ?? NATURE_IMAGES.wetland}
              alt={home.story.title}
              className="w-full max-w-full"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <Reveal className="min-w-0">
            <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
              {dict.about.story}
            </p>
            <h2 className="mt-3 font-heading text-2xl break-words sm:text-3xl md:text-4xl">
              {home.story.title}
            </h2>
            <RichHtml
              className="mt-5 text-[0.95rem] leading-7 break-words text-foreground/85 sm:text-base sm:leading-8"
              html={home.story.body}
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-mist/70 py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
              {home.features.eyebrow}
            </p>
            <h2 className="mt-3 font-heading text-3xl md:text-4xl">
              {home.features.heading}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {home.features.items.map((feature, index) => (
              <Reveal key={`${feature.title}-${index}`} delay={index * 0.08}>
                <article className="h-full rounded-2xl border border-border bg-card p-6">
                  <h3 className="font-heading text-xl">{feature.title}</h3>
                  <RichHtml
                    className="mt-4 text-sm leading-7 text-muted-foreground"
                    html={feature.body}
                  />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto w-full max-w-3xl px-6">
          <Reveal>
            <h2 className="font-heading text-3xl md:text-4xl">{home.how.title}</h2>
            <RichHtml
              className="mt-6 leading-8 text-foreground/85"
              html={home.how.body}
            />
          </Reveal>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="bg-mist/70 py-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
                  {home.listings.causesEyebrow}
                </p>
                <h2 className="mt-3 font-heading text-3xl">{home.listings.causesHeading}</h2>
              </div>
              <Link href={localizeHref(locale, "/causes")} className="text-sm text-primary">
                {dict.actions.viewAll}
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {featured.map((cause, index) => (
                <Reveal key={cause.id} delay={index * 0.08}>
                  <Link
                    href={localizeHref(locale, `/causes/${cause.slug}`)}
                    className="group block overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    <NatureImage
                      src={cause.image_url}
                      alt={pickLocalized(locale, cause.title, cause.title_en)}
                    />
                    <div className="space-y-2 p-5">
                      <h3 className="font-heading text-xl group-hover:text-primary">
                        {pickLocalized(locale, cause.title, cause.title_en)}
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {pickLocalized(
                          locale,
                          cause.short_description,
                          cause.short_description_en,
                        )}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {recentAlbums.length > 0 ? (
        <section className="py-20">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="flex items-end justify-between">
              <h2 className="font-heading text-3xl">{home.listings.galleryHeading}</h2>
              <Link href={localizeHref(locale, "/gallery")} className="text-sm text-primary">
                {dict.actions.viewAll}
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {recentAlbums.map((album) => (
                <Link
                  key={album.id}
                  href={localizeHref(locale, `/gallery/${album.slug}`)}
                  className="group"
                >
                  <NatureImage
                    src={album.cover_image_url}
                    alt={pickLocalized(locale, album.title, album.title_en)}
                  />
                  <p className="mt-3 font-heading text-lg group-hover:text-primary">
                    {pickLocalized(locale, album.title, album.title_en)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-mist/70 py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{dict.transparency.collected}</p>
            <p className="mt-2 font-heading text-3xl text-primary">
              {formatCurrency(locale, collected)}
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{dict.transparency.spent}</p>
            <p className="mt-2 font-heading text-3xl text-earth">
              {formatCurrency(locale, spent)}
            </p>
          </article>
          <article className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">{home.listings.transparencyHeading}</p>
            <Link
              href={localizeHref(locale, "/transparency")}
              className="mt-4 inline-block text-sm text-primary"
            >
              {dict.actions.seeTransparency}
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
