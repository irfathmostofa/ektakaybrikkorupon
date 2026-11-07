"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { formChecked, formOptional, formString } from "@/lib/admin/form";
import { CACHE_TAGS, EMPLOYMENT_TYPES, JOB_APPLICATION_STATUSES } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import type {
  EmploymentType,
  JobApplication,
  JobApplicationStatus,
  JobPosting,
} from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

export async function listJobPostings(): Promise<JobPosting[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_postings")
    .select("*")
    .order("deadline", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function listJobApplications(): Promise<JobApplication[]> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function saveJobPostingAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = formString(formData, "id");
  const title = formString(formData, "title");
  const slug = slugify(formString(formData, "slug")) || slugify(title);
  const employmentType = formString(formData, "employment_type") as EmploymentType;
  if (!title || !slug) {
    return { error: "Title is required." };
  }
  const supabase = await createClient();
  const payload = {
    title,
    title_en: formOptional(formData, "title_en"),
    slug,
    department: formOptional(formData, "department"),
    department_en: formOptional(formData, "department_en"),
    location: formOptional(formData, "location"),
    location_en: formOptional(formData, "location_en"),
    employment_type: EMPLOYMENT_TYPES.includes(employmentType)
      ? employmentType
      : "full_time",
    description: formOptional(formData, "description"),
    description_en: formOptional(formData, "description_en"),
    requirements: formOptional(formData, "requirements"),
    requirements_en: formOptional(formData, "requirements_en"),
    deadline: formOptional(formData, "deadline"),
    is_published: formChecked(formData, "is_published"),
  };
  const { error } = id
    ? await supabase.from("job_postings").update(payload).eq("id", id)
    : await supabase.from("job_postings").insert(payload);
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.careers, "max");
  revalidatePath("/admin/careers");
  return { success: id ? "Job updated." : "Job created." };
}

export async function deleteJobPostingAction(formData: FormData) {
  await requireStaff();
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("job_postings").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.careers, "max");
  revalidatePath("/admin/careers");
}

export async function updateJobApplicationAction(formData: FormData) {
  await requireStaff();
  const id = formString(formData, "id");
  const status = formString(formData, "status") as JobApplicationStatus;
  if (!id || !JOB_APPLICATION_STATUSES.includes(status)) {
    return;
  }
  const supabase = await createClient();
  await supabase.from("job_applications").update({ status }).eq("id", id);
  revalidateTag(CACHE_TAGS.careers, "max");
  revalidatePath("/admin/careers");
}
