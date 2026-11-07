import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogViewTracker } from "@/components/public/analytics-trackers";
import { NatureImage } from "@/components/public/nature-image";
import { PageHero } from "@/components/public/page-hero";
import { RichHtml } from "@/components/public/rich-html";
import { getPostBySlug } from "@/lib/content/public";
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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale, dict } = await getRequestDictionary();
  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={formatDate(locale, post.published_at)}
        title={pickLocalized(locale, post.title, post.title_en)}
        subtitle={pickLocalized(locale, post.excerpt, post.excerpt_en)}
      />
      <article className="mx-auto w-full max-w-3xl px-6 py-16">
        <Link href={localizeHref(locale, "/blog")} className="text-sm text-primary">
          {dict.actions.backToBlog}
        </Link>
        <div className="mt-6">
          <NatureImage
            src={post.cover_image_url}
            alt={pickLocalized(locale, post.title, post.title_en)}
            className="aspect-[16/9]"
          />
        </div>
        <RichHtml
          className="prose mt-8 max-w-none text-lg leading-9"
          html={pickLocalized(locale, post.content, post.content_en)}
        />
      </article>
      <BlogViewTracker slug={post.slug} />
    </>
  );
}
