"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { formChecked, formHtml, formNumber, formOptional, formString } from "@/lib/admin/form";
import { CACHE_TAGS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { TeamMember } from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

export async function listTeamMembers(): Promise<TeamMember[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function saveTeamMemberAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = formString(formData, "id");
  const fullName = formString(formData, "full_name");
  const roleTitle = formString(formData, "role_title");
  if (!fullName || !roleTitle) {
    return { error: "Name and role are required." };
  }
  const supabase = await createClient();
  const payload = {
    full_name: fullName,
    full_name_en: formOptional(formData, "full_name_en"),
    role_title: roleTitle,
    role_title_en: formOptional(formData, "role_title_en"),
    bio: formHtml(formData, "bio"),
    bio_en: formHtml(formData, "bio_en"),
    photo_url: formOptional(formData, "photo_url"),
    sort_order: formNumber(formData, "sort_order"),
    is_published: formChecked(formData, "is_published"),
  };
  const { error } = id
    ? await supabase.from("team_members").update(payload).eq("id", id)
    : await supabase.from("team_members").insert(payload);
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.about, "max");
  revalidatePath("/admin/pages");
  revalidatePath("/about");
  return { success: id ? "Team member updated." : "Team member added." };
}

export async function deleteTeamMemberAction(formData: FormData) {
  await requireStaff();
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.about, "max");
  revalidatePath("/admin/pages");
  revalidatePath("/about");
}
