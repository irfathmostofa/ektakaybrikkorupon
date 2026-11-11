import type { MetadataRoute } from "next";
import {
  getGalleryAlbums,
  getJobPostings,
  getPublishedCauses,
  getPublishedMagazines,
  getPublishedPosts,
} from "@/lib/content/public";
import { locales, localizeHref, type Locale } from "@/lib/i18n/config";
import { absoluteUrl, sitemapLanguageAlternates } from "@/lib/seo";

const STATIC_PATHS = [
  "/",
  "/about",
  "/causes",
  "/gallery",
  "/achievements",
  "/transparency",
  "/membership",
  "/careers",
  "/blog",
  "/magazines",
  "/contact",
  "/donate",
] as const;

function toDate(value?: string | Date | null) {
  if (!value) {
    return new Date();
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function localizedEntries(
  path: string,
  options: {
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
    lastModified?: string | Date | null;
  } = {},
): MetadataRoute.Sitemap {
  const lastModified = toDate(options.lastModified);
  const languages = sitemapLanguageAlternates(path);

  return locales.map((locale: Locale) => ({
    url: absoluteUrl(localizeHref(locale, path)),
    lastModified,
    changeFrequency: options.changeFrequency ?? "weekly",
    priority: options.priority ?? 0.7,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [causes, posts, albums, jobs, magazines] = await Promise.all([
    getPublishedCauses(),
    getPublishedPosts(),
    getGalleryAlbums(),
    getJobPostings(),
    getPublishedMagazines(),
  ]);

  return [
    ...STATIC_PATHS.flatMap((path) =>
      localizedEntries(path, {
        changeFrequency: path === "/" ? "daily" : "weekly",
        priority: path === "/" ? 1 : path === "/donate" ? 0.9 : 0.8,
      }),
    ),
    ...causes.flatMap((cause) =>
      localizedEntries(`/causes/${cause.slug}`, {
        changeFrequency: "weekly",
        priority: 0.7,
        lastModified: cause.updated_at,
      }),
    ),
    ...posts.flatMap((post) =>
      localizedEntries(`/blog/${post.slug}`, {
        changeFrequency: "monthly",
        priority: 0.6,
        lastModified: post.updated_at ?? post.published_at,
      }),
    ),
    ...albums.flatMap((album) =>
      localizedEntries(`/gallery/${album.slug}`, {
        changeFrequency: "weekly",
        priority: 0.6,
        lastModified: album.event_date,
      }),
    ),
    ...jobs.flatMap((job) =>
      localizedEntries(`/careers/${job.slug}`, {
        changeFrequency: "weekly",
        priority: 0.6,
        lastModified: job.deadline,
      }),
    ),
    ...magazines.flatMap((magazine) =>
      localizedEntries(`/magazines/${magazine.slug}`, {
        changeFrequency: "monthly",
        priority: 0.6,
        lastModified: magazine.updated_at ?? magazine.issue_date,
      }),
    ),
  ];
}
