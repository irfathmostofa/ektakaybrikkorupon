"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { formChecked, formNumber, formOptional, formString } from "@/lib/admin/form";
import { CACHE_TAGS, FINANCE_KINDS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { FinanceCategory, FinanceEntry, FinanceKind } from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

function parseKind(value: string): FinanceKind {
  return FINANCE_KINDS.includes(value as FinanceKind)
    ? (value as FinanceKind)
    : "collection";
}

export async function listFinanceCategories(): Promise<FinanceCategory[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function listFinanceEntries(): Promise<FinanceEntry[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("finance_entries")
    .select("*, category:finance_categories(*)")
    .order("entry_date", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as FinanceEntry[];
}

export async function saveFinanceCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const kind = parseKind(formString(formData, "kind"));
  if (!name) {
    return { error: "Name is required." };
  }
  const supabase = await createClient();
  const payload = {
    name,
    name_en: formOptional(formData, "name_en"),
    kind,
    is_active: formChecked(formData, "is_active") || !id,
  };
  const { error } = id
    ? await supabase.from("finance_categories").update(payload).eq("id", id)
    : await supabase.from("finance_categories").insert(payload);
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.finance, "max");
  revalidatePath("/admin/finance");
  return { success: id ? "Category updated." : "Category created." };
}

export async function deleteFinanceCategoryAction(formData: FormData) {
  await requireStaff();
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("finance_categories").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.finance, "max");
  revalidatePath("/admin/finance");
}

export async function saveFinanceEntryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = formString(formData, "id");
  const title = formString(formData, "title");
  const amount = formNumber(formData, "amount");
  const entryDate = formString(formData, "entry_date");
  const kind = parseKind(formString(formData, "kind"));

  if (!title || !entryDate) {
    return { error: "Title and date are required." };
  }

  const supabase = await createClient();
  const payload = {
    kind,
    category_id: formOptional(formData, "category_id"),
    title,
    title_en: formOptional(formData, "title_en"),
    description: formOptional(formData, "description"),
    description_en: formOptional(formData, "description_en"),
    amount,
    entry_date: entryDate,
    source_or_payee: formOptional(formData, "source_or_payee"),
    receipt_url: formOptional(formData, "receipt_url"),
    is_published: formChecked(formData, "is_published"),
  };

  const { error } = id
    ? await supabase.from("finance_entries").update(payload).eq("id", id)
    : await supabase.from("finance_entries").insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(CACHE_TAGS.finance, "max");
  revalidatePath("/admin/finance");
  return { success: id ? "Entry updated." : "Entry created." };
}

export async function deleteFinanceEntryAction(formData: FormData) {
  await requireStaff();
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("finance_entries").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.finance, "max");
  revalidatePath("/admin/finance");
}
