"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { formChecked, formHtml, formNumber, formOptional, formString } from "@/lib/admin/form";
import { CACHE_TAGS, MEMBERSHIP_STATUSES } from "@/lib/constants";
import { loadEmailjsCredentials, notifyQuietly } from "@/lib/email/emailjs";
import { membershipWelcomeEmail } from "@/lib/email/templates";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import type {
  Donation,
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
    .select(
      "*, plan:membership_plans(id, name, name_en, fee_amount, duration_label)",
    )
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as MembershipApplication[];
}

export async function listMembershipDonorRecords(): Promise<Donation[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations")
    .select(
      "*, cause:causes_projects(id, title, title_en), package:donation_packages(id, name, name_en, amount)",
    )
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as Donation[];
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

async function sendWelcomeEmails(applications: MembershipApplication[]) {
  if (!applications.length) {
    return;
  }
  const credentials = await loadEmailjsCredentials();
  const foundationName = credentials?.foundationName || "১টাকায় বৃক্ষরোপণ";
  const foundationNameEn = credentials?.foundationNameEn || "1 Taka Tree Plantation";
  await notifyQuietly(
    applications.map((application) => {
      const locale = application.locale === "en" ? "en" : "bn";
      const planName =
        pickLocalized(locale, application.plan?.name, application.plan?.name_en) ||
        "membership";
      return membershipWelcomeEmail({
        fullName: application.full_name,
        email: application.email,
        planName,
        locale,
        foundationName: locale === "en" ? foundationNameEn : foundationName,
      });
    }),
  );
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
  const { data: current } = await supabase
    .from("membership_applications")
    .select(
      "*, plan:membership_plans(id, name, name_en, fee_amount, duration_label)",
    )
    .eq("id", id)
    .maybeSingle();
  await supabase
    .from("membership_applications")
    .update({ status, admin_notes: adminNotes })
    .eq("id", id);
  if (status === "approved" && current && current.status !== "approved") {
    await sendWelcomeEmails([current as MembershipApplication]);
  }
  revalidateTag(CACHE_TAGS.membership, "max");
  revalidatePath("/admin/membership");
  revalidatePath("/admin", "layout");
}

export async function approveMembershipApplicationsAction(formData: FormData) {
  await requireStaff();
  const ids = formData
    .getAll("ids")
    .map((value) => String(value).trim())
    .filter(Boolean);
  if (!ids.length) {
    return;
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("membership_applications")
    .select(
      "*, plan:membership_plans(id, name, name_en, fee_amount, duration_label)",
    )
    .in("id", ids)
    .eq("status", "pending");
  const pending = (data ?? []) as MembershipApplication[];
  if (!pending.length) {
    return;
  }
  await supabase
    .from("membership_applications")
    .update({ status: "approved" })
    .in(
      "id",
      pending.map((item) => item.id),
    );
  await sendWelcomeEmails(pending);
  revalidateTag(CACHE_TAGS.membership, "max");
  revalidatePath("/admin/membership");
  revalidatePath("/admin", "layout");
}
