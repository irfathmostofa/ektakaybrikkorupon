"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { formChecked, formHtml, formNumber, formOptional, formString } from "@/lib/admin/form";
import { CACHE_TAGS, MEDIA_BUCKET } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import type { Magazine } from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

const MAX_PDF_BYTES = 25 * 1024 * 1024;

export async function listMagazines(): Promise<Magazine[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("magazines")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("issue_date", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function saveMagazineAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = formString(formData, "id");
  const title = formString(formData, "title");
  const slug = slugify(formString(formData, "slug")) || slugify(title);
  const pdfUrl = formString(formData, "pdf_url");
  if (!title || !slug) {
    return { error: "Title is required." };
  }
  if (!pdfUrl) {
    return { error: "Upload a PDF or paste a Google Drive link before saving." };
  }
  const supabase = await createClient();
  const payload = {
    title,
    title_en: formOptional(formData, "title_en"),
    slug,
    description: formHtml(formData, "description"),
    description_en: formHtml(formData, "description_en"),
    cover_image_url: formOptional(formData, "cover_image_url"),
    pdf_url: pdfUrl,
    issue_date: formOptional(formData, "issue_date"),
    sort_order: formNumber(formData, "sort_order"),
    is_published: formChecked(formData, "is_published"),
  };
  const { error } = id
    ? await supabase.from("magazines").update(payload).eq("id", id)
    : await supabase.from("magazines").insert(payload);
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.magazines, "max");
  revalidatePath("/admin/magazines");
  revalidatePath("/magazines");
  return { success: id ? "Magazine updated." : "Magazine created." };
}

export async function deleteMagazineAction(formData: FormData) {
  await requireStaff();
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("magazines").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.magazines, "max");
  revalidatePath("/admin/magazines");
  revalidatePath("/magazines");
}

export async function uploadMagazinePdfAction(formData: FormData) {
  await requireStaff();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a PDF to upload." };
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return { error: "Only PDF files are allowed." };
  }
  if (file.size > MAX_PDF_BYTES) {
    return { error: "PDF must be 25 MB or smaller." };
  }

  const path = `magazines/${Date.now()}-${crypto.randomUUID()}.pdf`;
  const supabase = await createClient();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: "application/pdf",
  });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { success: "PDF uploaded.", url: data.publicUrl, path };
}
