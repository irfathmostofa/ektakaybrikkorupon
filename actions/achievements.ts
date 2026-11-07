"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { formChecked, formNumber, formOptional, formString } from "@/lib/admin/form";
import { CACHE_TAGS } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import type { Achievement } from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

export async function listAchievements(): Promise<Achievement[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function saveAchievementAction(
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
    metric_value: formNumber(formData, "metric_value"),
    metric_label: formOptional(formData, "metric_label"),
    metric_label_en: formOptional(formData, "metric_label_en"),
    achieved_on: formOptional(formData, "achieved_on"),
    image_url: formOptional(formData, "image_url"),
    sort_order: formNumber(formData, "sort_order"),
    is_published: formChecked(formData, "is_published"),
  };
  const { error } = id
    ? await supabase.from("achievements").update(payload).eq("id", id)
    : await supabase.from("achievements").insert(payload);
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.achievements, "max");
  revalidatePath("/admin/achievements");
  return { success: id ? "Achievement updated." : "Achievement created." };
}

export async function deleteAchievementAction(formData: FormData) {
  await requireStaff();
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("achievements").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.achievements, "max");
  revalidatePath("/admin/achievements");
}
