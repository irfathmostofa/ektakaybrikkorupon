"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { formChecked, formNumber, formOptional, formString } from "@/lib/admin/form";
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
  const slug = slugify(formString(formData, "slug")) || slugify(name);
  if (!name || !slug) {
    return { error: "Name is required." };
  }
  const supabase = await createClient();
  const payload = {
    name,
    name_en: formOptional(formData, "name_en"),
    slug,
    description: formOptional(formData, "description"),
    description_en: formOptional(formData, "description_en"),
    fee_amount: formNumber(formData, "fee_amount"),
    duration_label: formOptional(formData, "duration_label"),
    duration_label_en: formOptional(formData, "duration_label_en"),
    benefits: formOptional(formData, "benefits"),
    benefits_en: formOptional(formData, "benefits_en"),
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
