import { BlogListing } from "@/components/public/blog-listing";
import { PageHero } from "@/components/public/page-hero";
import {
  getPublishedBlogCategories,
  getPublishedPosts,
} from "@/lib/content/public";
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
  const [posts, categories] = await Promise.all([
    getPublishedPosts(),
    getPublishedBlogCategories(),
  ]);

  return (
    <>
      <PageHero eyebrow={dict.blog.eyebrow} title={dict.nav.blog} />
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <BlogListing
          posts={posts}
          categories={categories}
          locale={locale}
          labels={{
            searchPlaceholder: dict.blog.searchPlaceholder,
            allCategories: dict.blog.allCategories,
            empty: dict.blog.empty,
            noResults: dict.blog.noResults,
          }}
        />
      </section>
    </>
  );
}
