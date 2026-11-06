"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { CACHE_TAGS, CAUSE_STATUSES } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import type { CauseStatus } from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

function parseCauseStatus(value: string): CauseStatus {
  return CAUSE_STATUSES.includes(value as CauseStatus)
    ? (value as CauseStatus)
    : "draft";
}

export async function listCauses() {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("causes_projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCause(id: string) {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("causes_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createCauseAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();

  const title = String(formData.get("title") ?? "").trim();
  const slug =
    slugify(String(formData.get("slug") ?? "")) || slugify(title);

  if (!title || !slug) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("causes_projects")
    .insert({
      title,
      slug,
      short_description:
        String(formData.get("short_description") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      goal_amount: Number(formData.get("goal_amount") ?? 0) || 0,
      image_url: String(formData.get("image_url") ?? "").trim() || null,
      status: parseCauseStatus(String(formData.get("status") ?? "draft")),
      featured: formData.get("featured") === "on",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidateTag(CACHE_TAGS.causes, "max");
  redirect(`/admin/causes/${data.id}`);
}

export async function updateCauseAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slug =
    slugify(String(formData.get("slug") ?? "")) || slugify(title);

  if (!id || !title || !slug) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("causes_projects")
    .update({
      title,
      slug,
      short_description:
        String(formData.get("short_description") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      goal_amount: Number(formData.get("goal_amount") ?? 0) || 0,
      image_url: String(formData.get("image_url") ?? "").trim() || null,
      status: parseCauseStatus(String(formData.get("status") ?? "draft")),
      featured: formData.get("featured") === "on",
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(CACHE_TAGS.causes, "max");
  revalidatePath("/admin/causes");
  return { success: "Cause updated." };
}

export async function deleteCauseAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.from("causes_projects").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidateTag(CACHE_TAGS.causes, "max");
  redirect("/admin/causes");
}
