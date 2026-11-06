import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants";
import {
  FALLBACK_ABOUT_SECTIONS,
  FALLBACK_ACHIEVEMENTS,
  FALLBACK_ALBUMS,
  FALLBACK_CAUSES,
  FALLBACK_FINANCE,
  FALLBACK_GALLERY_IMAGES,
  FALLBACK_JOBS,
  FALLBACK_PAGES,
  FALLBACK_PLANS,
  FALLBACK_POSTS,
  FALLBACK_TEAM,
} from "@/lib/content/fallbacks";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  AboutSection,
  Achievement,
  BlogPost,
  CauseProject,
  FinanceEntry,
  GalleryAlbum,
  GalleryImage,
  JobPosting,
  MembershipPlan,
  PageContent,
  TeamMember,
} from "@/lib/types/database";

async function safeQuery<T>(
  fallback: T,
  query: () => Promise<{ data: T | null; error: { message: string } | null }>,
): Promise<T> {
  if (!isSupabaseConfigured()) {
    return fallback;
  }
  try {
    const { data, error } = await query();
    if (error || data == null) {
      return fallback;
    }
    return data;
  } catch {
    return fallback;
  }
}

export async function getPageContent(pageKey: string): Promise<PageContent> {
  "use cache";
  cacheTag(CACHE_TAGS.pages);
  cacheLife("hours");

  const fallback = FALLBACK_PAGES[pageKey] ?? FALLBACK_PAGES.home;
  return safeQuery(fallback, async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_key", pageKey)
      .maybeSingle();
    return { data: (data as PageContent | null) ?? fallback, error };
  });
}

export async function getPublishedCauses(): Promise<CauseProject[]> {
  "use cache";
  cacheTag(CACHE_TAGS.causes);
  cacheLife("minutes");

  return safeQuery(FALLBACK_CAUSES, async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("causes_projects")
      .select("*")
      .in("status", ["active", "completed"])
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    return {
      data: data && data.length > 0 ? (data as CauseProject[]) : FALLBACK_CAUSES,
      error,
    };
  });
}

export async function getCauseBySlug(slug: string): Promise<CauseProject | null> {
  const causes = await getPublishedCauses();
  return causes.find((item) => item.slug === slug) ?? null;
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  "use cache";
  cacheTag(CACHE_TAGS.blog);
  cacheLife("minutes");

  return safeQuery(FALLBACK_POSTS, async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    return {
      data: data && data.length > 0 ? (data as BlogPost[]) : FALLBACK_POSTS,
      error,
    };
  });
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getPublishedPosts();
  return posts.find((item) => item.slug === slug) ?? null;
}

export async function getAboutSections(): Promise<AboutSection[]> {
  "use cache";
  cacheTag(CACHE_TAGS.about);
  cacheLife("hours");

  return safeQuery(FALLBACK_ABOUT_SECTIONS, async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("about_sections")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    return {
      data:
        data && data.length > 0
          ? (data as AboutSection[])
          : FALLBACK_ABOUT_SECTIONS,
      error,
    };
  });
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  "use cache";
  cacheTag(CACHE_TAGS.about);
  cacheLife("hours");

  return safeQuery(FALLBACK_TEAM, async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    return {
      data: data && data.length > 0 ? (data as TeamMember[]) : FALLBACK_TEAM,
      error,
    };
  });
}

export async function getGalleryAlbums(): Promise<GalleryAlbum[]> {
  "use cache";
  cacheTag(CACHE_TAGS.gallery);
  cacheLife("minutes");

  return safeQuery(FALLBACK_ALBUMS, async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("gallery_albums")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) {
      return { data: FALLBACK_ALBUMS, error };
    }
    const albums = data as GalleryAlbum[];
    const withCounts = await Promise.all(
      albums.map(async (album) => {
        const { count } = await supabase
          .from("gallery_images")
          .select("*", { count: "exact", head: true })
          .eq("album_id", album.id)
          .eq("is_published", true);
        return { ...album, image_count: count ?? 0 };
      }),
    );
    return { data: withCounts, error: null };
  });
}

export async function getAlbumBySlug(slug: string): Promise<GalleryAlbum | null> {
  const albums = await getGalleryAlbums();
  return albums.find((item) => item.slug === slug) ?? null;
}

export async function getAlbumImages(slug: string): Promise<GalleryImage[]> {
  "use cache";
  cacheTag(CACHE_TAGS.gallery);
  cacheLife("minutes");

  const fallback = FALLBACK_GALLERY_IMAGES[slug] ?? [];
  return safeQuery(fallback, async () => {
    const supabase = createPublicClient();
    const { data: album, error: albumError } = await supabase
      .from("gallery_albums")
      .select("id")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (albumError || !album) {
      return { data: fallback, error: albumError };
    }
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("album_id", album.id)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    return {
      data: data && data.length > 0 ? (data as GalleryImage[]) : fallback,
      error,
    };
  });
}

export async function getAchievements(): Promise<Achievement[]> {
  "use cache";
  cacheTag(CACHE_TAGS.achievements);
  cacheLife("hours");

  return safeQuery(FALLBACK_ACHIEVEMENTS, async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    return {
      data:
        data && data.length > 0
          ? (data as Achievement[])
          : FALLBACK_ACHIEVEMENTS,
      error,
    };
  });
}

export async function getFinanceEntries(): Promise<FinanceEntry[]> {
  "use cache";
  cacheTag(CACHE_TAGS.finance);
  cacheLife("minutes");

  return safeQuery(FALLBACK_FINANCE, async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("finance_entries")
      .select("*, category:finance_categories(*)")
      .eq("is_published", true)
      .order("entry_date", { ascending: false });
    return {
      data: data && data.length > 0 ? (data as FinanceEntry[]) : FALLBACK_FINANCE,
      error,
    };
  });
}

export async function getMembershipPlans(): Promise<MembershipPlan[]> {
  "use cache";
  cacheTag(CACHE_TAGS.membership);
  cacheLife("hours");

  return safeQuery(FALLBACK_PLANS, async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return {
      data: data && data.length > 0 ? (data as MembershipPlan[]) : FALLBACK_PLANS,
      error,
    };
  });
}

export async function getJobPostings(): Promise<JobPosting[]> {
  "use cache";
  cacheTag(CACHE_TAGS.careers);
  cacheLife("minutes");

  return safeQuery(FALLBACK_JOBS, async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("job_postings")
      .select("*")
      .eq("is_published", true)
      .order("deadline", { ascending: true });
    return {
      data: data && data.length > 0 ? (data as JobPosting[]) : FALLBACK_JOBS,
      error,
    };
  });
}

export async function getJobBySlug(slug: string): Promise<JobPosting | null> {
  const jobs = await getJobPostings();
  return jobs.find((item) => item.slug === slug) ?? null;
}
