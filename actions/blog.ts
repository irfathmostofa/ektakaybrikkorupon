"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { BLOG_STATUSES, CACHE_TAGS } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import type { BlogStatus } from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

function parseBlogStatus(value: string): BlogStatus {
  return BLOG_STATUSES.includes(value as BlogStatus)
    ? (value as BlogStatus)
    : "draft";
}

export async function listBlogPosts() {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getBlogPost(id: string) {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createBlogPostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const title = String(formData.get("title") ?? "").trim();
  const slug =
    slugify(String(formData.get("slug") ?? "")) || slugify(title);
  const status = parseBlogStatus(String(formData.get("status") ?? "draft"));

  if (!title || !slug) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title,
      title_en: String(formData.get("title_en") ?? "").trim() || null,
      slug,
      excerpt: String(formData.get("excerpt") ?? "").trim() || null,
      excerpt_en: String(formData.get("excerpt_en") ?? "").trim() || null,
      content: String(formData.get("content") ?? "").trim() || null,
      content_en: String(formData.get("content_en") ?? "").trim() || null,
      cover_image_url:
        String(formData.get("cover_image_url") ?? "").trim() || null,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag(CACHE_TAGS.blog, "max");
  redirect(`/admin/blog/${data.id}`);
}

export async function updateBlogPostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug =
    slugify(String(formData.get("slug") ?? "")) || slugify(title);
  const status = parseBlogStatus(String(formData.get("status") ?? "draft"));

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
      title_en: String(formData.get("title_en") ?? "").trim() || null,
      slug,
      excerpt: String(formData.get("excerpt") ?? "").trim() || null,
      excerpt_en: String(formData.get("excerpt_en") ?? "").trim() || null,
      content: String(formData.get("content") ?? "").trim() || null,
      content_en: String(formData.get("content_en") ?? "").trim() || null,
      cover_image_url:
        String(formData.get("cover_image_url") ?? "").trim() || null,
      status,
      published_at:
        status === "published"
          ? existing?.published_at ?? new Date().toISOString()
          : existing?.published_at ?? null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(CACHE_TAGS.blog, "max");
  revalidatePath("/admin/blog");
  return { success: "Post updated." };
}

export async function deleteBlogPostAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTag(CACHE_TAGS.blog, "max");
  redirect("/admin/blog");
}
