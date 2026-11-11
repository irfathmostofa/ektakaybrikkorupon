"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/public/empty-state";
import { NatureImage } from "@/components/public/nature-image";
import { Input } from "@/components/ui/input";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { formatDate } from "@/lib/i18n/format";
import { stripHtml } from "@/lib/sanitize-html";
import type { BlogCategory, BlogPost } from "@/lib/types/database";

function clipText(value: string, max = 110) {
  const text = stripHtml(value).replace(/\s+/g, " ").trim();
  if (!text) {
    return "";
  }
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 1).trimEnd()}...`;
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchPlaceholder}
          className="h-11 max-w-xl rounded-xl bg-background px-4 text-sm md:text-sm"
        />
        {categories.length > 0 ? (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                activeCategory === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
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
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => {
            const title = pickLocalized(locale, post.title, post.title_en);
            const excerpt = clipText(
              pickLocalized(locale, post.excerpt, post.excerpt_en) ||
                pickLocalized(locale, post.content, post.content_en),
            );
            const categoryLabel = (post.categories ?? [])
              .map((category) => pickLocalized(locale, category.name, category.name_en))
              .filter(Boolean)
              .slice(0, 2)
              .join(" · ");

            return (
              <Link
                key={post.id}
                href={localizeHref(locale, `/blog/${post.slug}`)}
                className="flex h-[26rem] flex-col overflow-hidden rounded-2xl border border-border bg-card"
              >
                <NatureImage
                  src={post.cover_image_url}
                  alt={title}
                  className="h-44 shrink-0 rounded-none !aspect-auto"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
                <div className="flex min-h-0 flex-1 flex-col gap-2 p-5">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(locale, post.published_at)}
                    {categoryLabel ? ` · ${categoryLabel}` : ""}
                  </p>
                  <h2 className="line-clamp-2 font-heading text-xl leading-7">{title}</h2>
                  <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {excerpt}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
