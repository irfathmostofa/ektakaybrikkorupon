import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogViewTracker } from "@/components/public/analytics-trackers";
import { NatureImage } from "@/components/public/nature-image";
import { RichHtml } from "@/components/public/rich-html";
import { getPostBySlug, getPublishedPosts } from "@/lib/content/public";
import { localizeHref } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatDate, formatNumber } from "@/lib/i18n/format";
import { getRequestDictionary } from "@/lib/i18n/server";
import { stripHtml } from "@/lib/sanitize-html";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getRequestDictionary()).locale;
  const post = await getPostBySlug(slug);
  if (!post) {
    return {};
  }
  return buildMetadata({
    title: pickLocalized(locale, post.title, post.title_en),
    description: pickLocalized(locale, post.excerpt, post.excerpt_en),
    path: `/blog/${post.slug}`,
    locale,
    image: post.cover_image_url,
    type: "article",
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
  });
}

function readingMinutes(value: string) {
  const words = stripHtml(value).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, dict } = await getRequestDictionary();
  const [post, posts] = await Promise.all([
    getPostBySlug(slug),
    getPublishedPosts(),
  ]);
  if (!post) {
    notFound();
  }

  const title = pickLocalized(locale, post.title, post.title_en);
  const excerpt = pickLocalized(locale, post.excerpt, post.excerpt_en);
  const content = pickLocalized(locale, post.content, post.content_en);
  const minutes = readingMinutes(content || excerpt);
  const categories = (post.categories ?? [])
    .map((category) => pickLocalized(locale, category.name, category.name_en))
    .filter(Boolean);
  const related = posts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <article>
        <header className="relative overflow-hidden bg-mist/70">
          <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 md:py-16">
            <Link
              href={localizeHref(locale, "/blog")}
              className="text-sm font-medium text-primary hover:underline"
            >
              {dict.actions.backToBlog}
            </Link>
            {categories.length > 0 ? (
              <p className="mt-6 text-xs font-medium tracking-[0.22em] text-primary uppercase">
                {categories.join(" · ")}
              </p>
            ) : (
              <p className="mt-6 text-xs font-medium tracking-[0.22em] text-primary uppercase">
                {dict.blog.eyebrow}
              </p>
            )}
            <h1 className="mt-4 font-heading text-3xl leading-tight text-balance text-canopy sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {excerpt ? (
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {stripHtml(excerpt)}
              </p>
            ) : null}
            <p className="mt-6 text-sm text-muted-foreground">
              {formatDate(locale, post.published_at)}
              {` · ${dict.blog.readTime.replace("{n}", formatNumber(locale, minutes))}`}
            </p>
          </div>
        </header>

        {post.cover_image_url ? (
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
            <NatureImage
              src={post.cover_image_url}
              alt={title}
              natural
              className="-mt-2 rounded-2xl sm:rounded-3xl"
            />
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <RichHtml
            className="blog-article text-base leading-8 sm:text-lg sm:leading-9"
            html={content}
          />
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-border bg-mist/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
              {dict.blog.eyebrow}
            </p>
            <h2 className="mt-3 font-heading text-2xl text-canopy sm:text-3xl">
              {dict.blog.related}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => {
                const itemTitle = pickLocalized(locale, item.title, item.title_en);
                return (
                  <Link
                    key={item.id}
                    href={localizeHref(locale, `/blog/${item.slug}`)}
                    className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
                  >
                    <NatureImage
                      src={item.cover_image_url}
                      alt={itemTitle}
                      className="aspect-[16/10] rounded-none"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                    <div className="space-y-2 p-5">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(locale, item.published_at)}
                      </p>
                      <h3 className="font-heading text-lg leading-7 group-hover:text-primary">
                        {itemTitle}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <BlogViewTracker slug={post.slug} />
    </>
  );
}
