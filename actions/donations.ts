"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireMenu } from "@/lib/admin/access";
import { requireStaff } from "@/lib/auth";
import { formHtml, formNumber, formOptional, formString } from "@/lib/admin/form";
import { CACHE_TAGS, DONATION_STATUSES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Donation, DonationPackage, DonationStatus } from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

function parseStatus(value: string): DonationStatus {
  return DONATION_STATUSES.includes(value as DonationStatus)
    ? (value as DonationStatus)
    : "pending";
}

export async function listDonations(): Promise<Donation[]> {
  await requireMenu("donations");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations")
    .select("*, cause:causes_projects(id, title, title_en), package:donation_packages(id, name, name_en, amount)")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as Donation[];
}

export async function saveDonationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMenu("donations");
  const id = formString(formData, "id");
  const donorName = formString(formData, "donor_name");
  const donorEmail = formString(formData, "donor_email");
  const amount = formNumber(formData, "amount");
  if (!donorName || !donorEmail || amount <= 0) {
    return { error: "Donor, email, and amount are required." };
  }
  const payload = {
    donor_name: donorName,
    donor_email: donorEmail,
    donor_phone: formOptional(formData, "donor_phone"),
    amount,
    status: parseStatus(formString(formData, "status")),
    package_id: formOptional(formData, "package_id"),
    cause_id: formOptional(formData, "cause_id"),
    payment_method: formOptional(formData, "payment_method"),
    transaction_id: formOptional(formData, "transaction_id"),
  };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("donations").update(payload).eq("id", id)
    : await supabase.from("donations").insert(payload);
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.donations, "max");
  revalidatePath("/admin/donations");
  return { success: id ? "Donation updated." : "Donation added." };
}

export async function deleteDonationAction(formData: FormData) {
  await requireMenu("donations");
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("donations").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.donations, "max");
  revalidatePath("/admin/donations");
}

export async function listDonationPackages(): Promise<DonationPackage[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donation_packages")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function saveDonationPackageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMenu("packages");
  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const amount = formNumber(formData, "amount");
  if (!name || amount <= 0) {
    return { error: "Name and amount are required." };
  }
  const payload = {
    name,
    name_en: formOptional(formData, "name_en"),
    amount,
    description: formHtml(formData, "description"),
    description_en: formHtml(formData, "description_en"),
    is_active: formData.get("is_active") === "on" || formData.get("is_active") === "true",
    sort_order: formNumber(formData, "sort_order"),
  };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("donation_packages").update(payload).eq("id", id)
    : await supabase.from("donation_packages").insert(payload);
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.packages, "max");
  revalidatePath("/admin/packages");
  revalidatePath("/donate");
  return { success: id ? "Package updated." : "Package created." };
}

export async function deleteDonationPackageAction(formData: FormData) {
  await requireMenu("packages");
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("donation_packages").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.packages, "max");
  revalidatePath("/admin/packages");
  revalidatePath("/donate");
}
