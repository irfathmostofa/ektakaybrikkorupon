"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { formChecked, formHtml, formNumber, formOptional, formString } from "@/lib/admin/form";
import { CACHE_TAGS, MEMBERSHIP_STATUSES } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import type {
  MembershipApplication,
  MembershipPlan,
  MembershipStatus,
} from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

export async function listMembershipPlans(): Promise<MembershipPlan[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membership_plans")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function listMembershipApplications(): Promise<MembershipApplication[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membership_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function saveMembershipPlanAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const nameEn = formOptional(formData, "name_en");
  if (!name) {
    return { error: "Name is required." };
  }
  let slug =
    slugify(formString(formData, "slug")) ||
    slugify(nameEn ?? "") ||
    slugify(name) ||
    (id ? `plan-${id.slice(0, 8)}` : `plan-${Date.now().toString(36)}`);
  const supabase = await createClient();
  const { data: slugOwner } = await supabase
    .from("membership_plans")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (slugOwner && slugOwner.id !== id) {
    slug = `${slug}-${Date.now().toString(36)}`.slice(0, 80);
  }
  const payload = {
    name,
    name_en: nameEn,
    slug,
    description: formHtml(formData, "description"),
    description_en: formHtml(formData, "description_en"),
    fee_amount: formNumber(formData, "fee_amount"),
    duration_label: formOptional(formData, "duration_label"),
    duration_label_en: formOptional(formData, "duration_label_en"),
    benefits: formHtml(formData, "benefits"),
    benefits_en: formHtml(formData, "benefits_en"),
    is_active: formChecked(formData, "is_active"),
    sort_order: formNumber(formData, "sort_order"),
  };
  const { error } = id
    ? await supabase.from("membership_plans").update(payload).eq("id", id)
    : await supabase.from("membership_plans").insert(payload);
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.membership, "max");
  revalidatePath("/admin/membership");
  revalidatePath("/membership");
  return { success: id ? "Plan updated." : "Plan created." };
}

export async function deleteMembershipPlanAction(formData: FormData) {
  await requireStaff();
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("membership_plans").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.membership, "max");
  revalidatePath("/admin/membership");
  revalidatePath("/membership");
}

export async function updateMembershipApplicationAction(formData: FormData) {
  await requireStaff();
  const id = formString(formData, "id");
  const status = formString(formData, "status") as MembershipStatus;
  const adminNotes = formOptional(formData, "admin_notes");
  if (!id || !MEMBERSHIP_STATUSES.includes(status)) {
    return;
  }
  const supabase = await createClient();
  await supabase
    .from("membership_applications")
    .update({ status, admin_notes: adminNotes })
    .eq("id", id);
  revalidateTag(CACHE_TAGS.membership, "max");
  revalidatePath("/admin/membership");
}
