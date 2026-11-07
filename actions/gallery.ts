"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { formChecked, formNumber, formOptional, formString } from "@/lib/admin/form";
import { CACHE_TAGS } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import type { GalleryAlbum, GalleryImage } from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

export async function listGalleryAlbums(): Promise<GalleryAlbum[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  const albums = (data ?? []) as GalleryAlbum[];
  const withCounts = await Promise.all(
    albums.map(async (album) => {
      const { count } = await supabase
        .from("gallery_images")
        .select("*", { count: "exact", head: true })
        .eq("album_id", album.id);
      return { ...album, image_count: count ?? 0 };
    }),
  );
  return withCounts;
}

export async function listGalleryImages(albumId: string): Promise<GalleryImage[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function saveGalleryAlbumAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = formString(formData, "id");
  const title = formString(formData, "title");
  const slug = slugify(formString(formData, "slug")) || slugify(title);
  if (!title || !slug) {
    return { error: "Title is required." };
  }
  const supabase = await createClient();
  const payload = {
    title,
    title_en: formOptional(formData, "title_en"),
    slug,
    description: formOptional(formData, "description"),
    description_en: formOptional(formData, "description_en"),
    cover_image_url: formOptional(formData, "cover_image_url"),
    event_date: formOptional(formData, "event_date"),
    sort_order: formNumber(formData, "sort_order"),
    is_published: formChecked(formData, "is_published"),
  };
  const { error } = id
    ? await supabase.from("gallery_albums").update(payload).eq("id", id)
    : await supabase.from("gallery_albums").insert(payload);
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.gallery, "max");
  revalidatePath("/admin/gallery");
  return { success: id ? "Category updated." : "Category created." };
}

export async function deleteGalleryAlbumAction(formData: FormData) {
  await requireStaff();
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_albums").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.gallery, "max");
  revalidatePath("/admin/gallery");
}

export async function addGalleryImagesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const albumId = formString(formData, "album_id");
  const urls = formData
    .getAll("image_urls")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const extra = formString(formData, "image_url");
  if (extra) {
    urls.push(extra);
  }
  if (!albumId || urls.length === 0) {
    return { error: "Choose at least one image." };
  }
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("gallery_images")
    .select("sort_order")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: false })
    .limit(1);
  let order = Number(existing?.[0]?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("gallery_images").insert(
    urls.map((image_url) => {
      const row = {
        album_id: albumId,
        image_url,
        caption: formOptional(formData, "caption"),
        caption_en: formOptional(formData, "caption_en"),
        alt_text: formOptional(formData, "alt_text"),
        alt_text_en: formOptional(formData, "alt_text_en"),
        sort_order: order,
        is_published: true,
      };
      order += 1;
      return row;
    }),
  );
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.gallery, "max");
  revalidatePath("/admin/gallery");
  return { success: "Images added." };
}

export async function deleteGalleryImageAction(formData: FormData) {
  await requireStaff();
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.gallery, "max");
  revalidatePath("/admin/gallery");
}

export async function reorderGalleryImagesAction(formData: FormData) {
  await requireStaff();
  const ids = formString(formData, "ordered_ids")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const supabase = await createClient();
  await Promise.all(
    ids.map((id, index) =>
      supabase.from("gallery_images").update({ sort_order: index }).eq("id", id),
    ),
  );
  revalidateTag(CACHE_TAGS.gallery, "max");
  revalidatePath("/admin/gallery");
}
