"use server";

import { revalidateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/actions/settings";

export async function listPages() {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_content")
    .select("*")
    .order("page_key", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getPage(id: string) {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_content")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updatePageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!id || !title) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("page_content")
    .update({
      title,
      subtitle: String(formData.get("subtitle") ?? "").trim() || null,
      body: String(formData.get("body") ?? "").trim() || null,
      hero_image_url:
        String(formData.get("hero_image_url") ?? "").trim() || null,
      meta_title: String(formData.get("meta_title") ?? "").trim() || null,
      meta_description:
        String(formData.get("meta_description") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(CACHE_TAGS.pages, "max");
  return { success: "Page content saved." };
}
