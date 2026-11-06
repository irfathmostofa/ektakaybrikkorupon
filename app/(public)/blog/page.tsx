import Link from "next/link";
import { EmptyState } from "@/components/public/empty-state";
import { NatureImage } from "@/components/public/nature-image";
import { PageHero } from "@/components/public/page-hero";
import { getPublishedPosts } from "@/lib/content/public";
import { localizeHref } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatDate } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const { locale, dict } = await getRequestDictionary();
  return buildMetadata({
    title: dict.nav.blog,
    description: dict.blog.eyebrow,
    path: "/blog",
    locale,
  });
}

export default async function BlogPage() {
  const { locale, dict } = await getRequestDictionary();
  const posts = await getPublishedPosts();

  return (
    <>
      <PageHero eyebrow={dict.blog.eyebrow} title={dict.nav.blog} />
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        {posts.length === 0 ? (
          <EmptyState message={dict.blog.empty} />
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={localizeHref(locale, `/blog/${post.slug}`)}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <NatureImage
                  src={post.cover_image_url}
                  alt={pickLocalized(locale, post.title, post.title_en)}
                  className="aspect-[16/9]"
                />
                <div className="space-y-2 p-5">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(locale, post.published_at)}
                  </p>
                  <h2 className="font-heading text-2xl">
                    {pickLocalized(locale, post.title, post.title_en)}
                  </h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {pickLocalized(locale, post.excerpt, post.excerpt_en)}
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
