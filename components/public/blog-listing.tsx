"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/public/empty-state";
import { NatureImage } from "@/components/public/nature-image";
import { Input } from "@/components/ui/input";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatDate, formatNumber } from "@/lib/i18n/format";
import { stripHtml } from "@/lib/sanitize-html";
import type { BlogCategory, BlogPost } from "@/lib/types/database";

function clipText(value: string, max = 160) {
  const text = stripHtml(value).replace(/\s+/g, " ").trim();
  if (!text) {
    return "";
  }
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 1).trimEnd()}...`;
}

function readingMinutes(value: string) {
  const words = stripHtml(value).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export function BlogListing({
  posts,
  categories,
  locale,
  labels,
}: {
  posts: BlogPost[];
  categories: BlogCategory[];
  locale: Locale;
  labels: {
    searchPlaceholder: string;
    allCategories: string;
    empty: string;
    noResults: string;
    featured: string;
    readArticle: string;
    readTime: string;
    resultCount: string;
  };
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPosts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "all" ||
        (post.categories ?? []).some((category) => category.slug === activeCategory);
      if (!matchesCategory) {
        return false;
      }
      if (!needle) {
        return true;
      }
      const haystack = [
        pickLocalized(locale, post.title, post.title_en),
        pickLocalized(locale, post.excerpt, post.excerpt_en),
        pickLocalized(locale, post.content, post.content_en),
        ...(post.categories ?? []).map((category) =>
          pickLocalized(locale, category.name, category.name_en),
        ),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [activeCategory, locale, posts, query]);

  if (posts.length === 0) {
    return <EmptyState message={labels.empty} />;
  }

  const [featured, ...rest] = filteredPosts;
  const showFeatured = !query.trim() && activeCategory === "all" && Boolean(featured);
  const gridPosts = showFeatured ? rest : filteredPosts;
  const countLabel = labels.resultCount.replace("{n}", formatNumber(locale, filteredPosts.length));

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/70 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              aria-label={labels.searchPlaceholder}
              className="h-11 rounded-xl bg-background pr-4 pl-10 text-base md:text-sm"
            />
          </div>
          <p className="text-sm text-muted-foreground">{countLabel}</p>
        </div>
        {categories.length > 0 ? (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                activeCategory === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {labels.allCategories}
            </button>
            {categories.map((category) => {
              const active = activeCategory === category.slug;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.slug)}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {pickLocalized(locale, category.name, category.name_en)}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {filteredPosts.length === 0 ? (
        <EmptyState message={labels.noResults} />
      ) : (
        <div className="space-y-8 md:space-y-10">
          {showFeatured && featured ? (
            <FeaturedPostCard post={featured} locale={locale} labels={labels} />
          ) : null}
          {gridPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post) => (
                <PostCard key={post.id} post={post} locale={locale} readTime={labels.readTime} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function postMeta(post: BlogPost, locale: Locale) {
  const title = pickLocalized(locale, post.title, post.title_en);
  const excerpt = clipText(
    pickLocalized(locale, post.excerpt, post.excerpt_en) ||
      pickLocalized(locale, post.content, post.content_en),
  );
  const categories = (post.categories ?? [])
    .map((category) => pickLocalized(locale, category.name, category.name_en))
    .filter(Boolean);
  const minutes = readingMinutes(
    pickLocalized(locale, post.content, post.content_en) || excerpt,
  );
  return { title, excerpt, categories, minutes };
}

function FeaturedPostCard({
  post,
  locale,
  labels,
}: {
  post: BlogPost;
  locale: Locale;
  labels: { featured: string; readArticle: string; readTime: string };
}) {
  const { title, excerpt, categories, minutes } = postMeta(post, locale);

  return (
    <Link
      href={localizeHref(locale, `/blog/${post.slug}`)}
      className="group grid overflow-hidden rounded-3xl border border-border bg-card transition-shadow hover:shadow-md md:grid-cols-[1.15fr_0.85fr]"
    >
      <NatureImage
        src={post.cover_image_url}
        alt={title}
        className="aspect-[16/10] rounded-none md:aspect-auto md:min-h-[22rem] md:h-full"
        sizes="(min-width: 768px) 55vw, 100vw"
        priority
      />
      <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 md:p-10">
        <p className="text-xs font-medium tracking-[0.22em] text-primary uppercase">
          {labels.featured}
        </p>
        <h2 className="font-heading text-2xl leading-tight text-balance text-canopy sm:text-3xl md:text-4xl group-hover:text-primary">
          {title}
        </h2>
        {excerpt ? (
          <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {excerpt}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground sm:text-sm">
          {formatDate(locale, post.published_at)}
          {categories[0] ? ` · ${categories[0]}` : ""}
          {` · ${labels.readTime.replace("{n}", formatNumber(locale, minutes))}`}
        </p>
        <span className="text-sm font-medium text-primary">{labels.readArticle}</span>
      </div>
    </Link>
  );
}

function PostCard({
  post,
  locale,
  readTime,
}: {
  post: BlogPost;
  locale: Locale;
  readTime: string;
}) {
  const { title, excerpt, categories, minutes } = postMeta(post, locale);

  return (
    <Link
      href={localizeHref(locale, `/blog/${post.slug}`)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <NatureImage
        src={post.cover_image_url}
        alt={title}
        className="aspect-[16/10] rounded-none"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-5">
        {categories.length > 0 ? (
          <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
            {categories.slice(0, 2).join(" · ")}
          </p>
        ) : null}
        <h2 className="line-clamp-2 font-heading text-xl leading-7 text-balance group-hover:text-primary">
          {title}
        </h2>
        {excerpt ? (
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{excerpt}</p>
        ) : null}
        <p className="mt-auto pt-2 text-xs text-muted-foreground">
          {formatDate(locale, post.published_at)}
          {` · ${readTime.replace("{n}", formatNumber(locale, minutes))}`}
        </p>
      </div>
    </Link>
  );
}
