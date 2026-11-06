"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { MEDIA_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function listMedia() {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).filter((item) => item.name && !item.name.startsWith("."));
}

export async function getMediaPublicUrl(path: string) {
  const supabase = await createClient();
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMediaAction(formData: FormData) {
  await requireStaff();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  revalidatePath("/admin/media");
  return { success: "Image uploaded.", url: data.publicUrl, path };
}

export async function deleteMediaAction(formData: FormData) {
  await requireStaff();
  const path = String(formData.get("path") ?? "");

  if (!path) {
    throw new Error("Missing media path.");
  }

  const supabase = await createClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/media");
}
