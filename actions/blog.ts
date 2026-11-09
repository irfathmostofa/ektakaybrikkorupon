"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireMenu } from "@/lib/admin/access";
import { requireStaff } from "@/lib/auth";
import { formHtml, formIdList, formOptional, formString } from "@/lib/admin/form";
import { BLOG_STATUSES, CACHE_TAGS } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import type { BlogCategory, BlogPost, BlogStatus, BlogTag } from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

function parseBlogStatus(value: string): BlogStatus {
  return BLOG_STATUSES.includes(value as BlogStatus)
    ? (value as BlogStatus)
    : "draft";
}

function isMissingRelation(error: { message?: string; code?: string } | null) {
  if (!error?.message) {
    return false;
  }
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /could not find the table/i.test(error.message) ||
    /does not exist/i.test(error.message) ||
    /schema cache/i.test(error.message)
  );
}

async function syncPostRelations(
  postId: string,
  categoryIds: string[],
  tagIds: string[],
) {
  const supabase = await createClient();
  await supabase.from("blog_post_categories").delete().eq("post_id", postId);
  await supabase.from("blog_post_tags").delete().eq("post_id", postId);

  if (categoryIds.length) {
    await supabase.from("blog_post_categories").insert(
      categoryIds.map((category_id) => ({ post_id: postId, category_id })),
    );
  }
  if (tagIds.length) {
    await supabase.from("blog_post_tags").insert(
      tagIds.map((tag_id) => ({ post_id: postId, tag_id })),
    );
  }
}

export async function listBlogCategories(): Promise<BlogCategory[]> {
  await requireMenu("blog");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    if (isMissingRelation(error)) {
      return [];
    }
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function listBlogTags(): Promise<BlogTag[]> {
  await requireMenu("blog");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_tags")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    if (isMissingRelation(error)) {
      return [];
    }
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function listBlogPosts(): Promise<BlogPost[]> {
  await requireMenu("blog");
  const supabase = await createClient();
  const [{ data, error }, categories, tags] = await Promise.all([
    supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
    listBlogCategories(),
    listBlogTags(),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  const posts = (data ?? []) as BlogPost[];
  const postIds = posts.map((post) => post.id);
  const [{ data: categoryRows, error: categoryRelError }, { data: tagRows, error: tagRelError }] =
    await Promise.all([
      supabase
        .from("blog_post_categories")
        .select("post_id, category_id")
        .in("post_id", postIds.length ? postIds : ["00000000-0000-0000-0000-000000000000"]),
      supabase
        .from("blog_post_tags")
        .select("post_id, tag_id")
        .in("post_id", postIds.length ? postIds : ["00000000-0000-0000-0000-000000000000"]),
    ]);
  if (categoryRelError && !isMissingRelation(categoryRelError)) {
    throw new Error(categoryRelError.message);
  }
  if (tagRelError && !isMissingRelation(tagRelError)) {
    throw new Error(tagRelError.message);
  }

  const categoriesById = new Map(categories.map((item) => [item.id, item]));
  const tagsById = new Map(tags.map((item) => [item.id, item]));

  return posts.map((post) => ({
    ...post,
    categories: (categoryRows ?? [])
      .filter((row) => row.post_id === post.id)
      .map((row) => categoriesById.get(row.category_id))
      .filter((item): item is BlogCategory => Boolean(item)),
    tags: (tagRows ?? [])
      .filter((row) => row.post_id === post.id)
      .map((row) => tagsById.get(row.tag_id))
      .filter((item): item is BlogTag => Boolean(item)),
  }));
}

export async function getBlogPost(id: string) {
  const posts = await listBlogPosts();
  return posts.find((post) => post.id === id) ?? null;
}

export async function getBlogAnalytics() {
  await requireStaff();
  const supabase = await createClient();
  const [{ data: posts }, { data: settings }] = await Promise.all([
    supabase.from("blog_posts").select("view_count"),
    supabase.from("site_settings").select("visitor_count").eq("id", 1).maybeSingle(),
  ]);
  const totalReads = (posts ?? []).reduce(
    (sum, row) => sum + Number(row.view_count ?? 0),
    0,
  );
  return {
    totalReads,
    totalVisitors: Number(settings?.visitor_count ?? 0),
  };
}

export async function createBlogPostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMenu("blog");
  const title = formString(formData, "title");
  const slug = slugify(formString(formData, "slug")) || slugify(title);
  const status = parseBlogStatus(formString(formData, "status") || "draft");

  if (!title || !slug) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title,
      title_en: formOptional(formData, "title_en"),
      slug,
      excerpt: formOptional(formData, "excerpt"),
      excerpt_en: formOptional(formData, "excerpt_en"),
      content: formHtml(formData, "content"),
      content_en: formHtml(formData, "content_en"),
      cover_image_url: formOptional(formData, "cover_image_url"),
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  await syncPostRelations(
    data.id,
    formIdList(formData, "category_ids"),
    formIdList(formData, "tag_ids"),
  );

  revalidateTag(CACHE_TAGS.blog, "max");
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${data.id}`);
  return { success: "Post created." };
}

export async function updateBlogPostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMenu("blog");
  const id = formString(formData, "id");
  const title = formString(formData, "title");
  const slug = slugify(formString(formData, "slug")) || slugify(title);
  const status = parseBlogStatus(formString(formData, "status") || "draft");

  if (!id || !title || !slug) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      title_en: formOptional(formData, "title_en"),
      slug,
      excerpt: formOptional(formData, "excerpt"),
      excerpt_en: formOptional(formData, "excerpt_en"),
      content: formHtml(formData, "content"),
      content_en: formHtml(formData, "content_en"),
      cover_image_url: formOptional(formData, "cover_image_url"),
      status,
      published_at:
        status === "published"
          ? existing?.published_at ?? new Date().toISOString()
          : null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await syncPostRelations(
    id,
    formIdList(formData, "category_ids"),
    formIdList(formData, "tag_ids"),
  );

  revalidateTag(CACHE_TAGS.blog, "max");
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}`);
  return { success: "Post updated." };
}

export async function toggleBlogPostStatusAction(formData: FormData) {
  await requireMenu("blog");
  const id = formString(formData, "id");
  if (!id) {
    return;
  }
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", id)
    .maybeSingle();
  if (!existing) {
    return;
  }
  const nextStatus: BlogStatus = existing.status === "published" ? "draft" : "published";
  const { error } = await supabase
    .from("blog_posts")
    .update({
      status: nextStatus,
      published_at:
        nextStatus === "published"
          ? existing.published_at ?? new Date().toISOString()
          : null,
    })
    .eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.blog, "max");
  revalidatePath("/admin/blog");
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireMenu("blog");
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.blog, "max");
  revalidatePath("/admin/blog");
}

export async function createBlogCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMenu("blog");
  const name = formString(formData, "name");
  const slug = slugify(formString(formData, "slug")) || slugify(name);
  if (!name || !slug) {
    return { error: "Name is required." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("blog_categories").insert({
    name,
    name_en: formOptional(formData, "name_en"),
    slug,
  });
  if (error) {
    if (isMissingRelation(error)) {
      return {
        error: "Run supabase/phase7.sql in the Supabase SQL Editor to create blog categories.",
      };
    }
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.blog, "max");
  revalidatePath("/admin/blog");
  return { success: "Category created." };
}

export async function updateBlogCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMenu("blog");
  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const slug = slugify(formString(formData, "slug")) || slugify(name);
  if (!id || !name || !slug) {
    return { error: "Name is required." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_categories")
    .update({ name, name_en: formOptional(formData, "name_en"), slug })
    .eq("id", id);
  if (error) {
    if (isMissingRelation(error)) {
      return {
        error: "Run supabase/phase7.sql in the Supabase SQL Editor to create blog categories.",
      };
    }
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.blog, "max");
  revalidatePath("/admin/blog");
  return { success: "Category updated." };
}

export async function deleteBlogCategoryAction(formData: FormData) {
  await requireMenu("blog");
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("blog_categories").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.blog, "max");
  revalidatePath("/admin/blog");
}

export async function createBlogTagAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMenu("blog");
  const name = formString(formData, "name");
  const slug = slugify(formString(formData, "slug")) || slugify(name);
  if (!name || !slug) {
    return { error: "Name is required." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("blog_tags").insert({
    name,
    name_en: formOptional(formData, "name_en"),
    slug,
  });
  if (error) {
    if (isMissingRelation(error)) {
      return { error: "Run supabase/phase7.sql in the Supabase SQL Editor to create blog_tags." };
    }
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.blog, "max");
  revalidatePath("/admin/blog");
  return { success: "Tag created." };
}

export async function updateBlogTagAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMenu("blog");
  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const slug = slugify(formString(formData, "slug")) || slugify(name);
  if (!id || !name || !slug) {
    return { error: "Name is required." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_tags")
    .update({ name, name_en: formOptional(formData, "name_en"), slug })
    .eq("id", id);
  if (error) {
    if (isMissingRelation(error)) {
      return { error: "Run supabase/phase7.sql in the Supabase SQL Editor to create blog_tags." };
    }
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.blog, "max");
  revalidatePath("/admin/blog");
  return { success: "Tag updated." };
}

export async function deleteBlogTagAction(formData: FormData) {
  await requireMenu("blog");
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("blog_tags").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.blog, "max");
  revalidatePath("/admin/blog");
}
