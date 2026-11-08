"use server";

import { revalidatePath } from "next/cache";
import { MEDIA_BUCKET } from "@/lib/constants";
import { loadEmailjsCredentials, notifyQuietly } from "@/lib/email/emailjs";
import {
  careerAdminEmail,
  careerConfirmationEmail,
  contactAdminEmail,
  contactAutoReplyEmail,
  membershipAdminEmail,
  membershipConfirmationEmail,
} from "@/lib/email/templates";
import { pickLocalized } from "@/lib/i18n/dictionary";
import { getLocale, type Locale } from "@/lib/i18n/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { ActionState } from "@/actions/settings";

function required(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function foundationName(locale: Locale, bn: string | null | undefined, en: string | null | undefined) {
  return pickLocalized(locale, bn, en) || (locale === "en" ? "1 Taka Tree Plantation" : "১টাকায় বৃক্ষরোপণ");
}

export async function submitMembershipAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fullName = required(formData.get("full_name"));
  const email = required(formData.get("email"));
  const phone = required(formData.get("phone"));
  const address = required(formData.get("address"));
  const planId = required(formData.get("plan_id"));
  const motivation = required(formData.get("motivation"));
  const locale = getLocale(required(formData.get("locale")));

  if (!fullName || !email || !phone || !address || !planId || !motivation) {
    return { error: "required" };
  }
  if (!isEmail(email)) {
    return { error: "email" };
  }

  if (!isSupabaseConfigured()) {
    return { success: "ok" };
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from("membership_applications").insert({
    full_name: fullName,
    email,
    phone,
    address,
    plan_id: planId,
    motivation,
    status: "pending",
    locale,
  });

  if (error) {
    return { success: "ok" };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/membership");

  const [{ data: plan }, credentials] = await Promise.all([
    supabase
      .from("membership_plans")
      .select("name, name_en")
      .eq("id", planId)
      .maybeSingle(),
    loadEmailjsCredentials(),
  ]);
  const planName = pickLocalized(locale, plan?.name, plan?.name_en) || planId;
  const name = foundationName(
    locale,
    credentials?.foundationName,
    credentials?.foundationNameEn,
  );

  await notifyQuietly([
    membershipConfirmationEmail({
      fullName,
      email,
      planName,
      locale,
      foundationName: name,
    }),
    credentials?.contactEmail
      ? membershipAdminEmail({
          fullName,
          email,
          phone,
          planName,
          motivation,
          adminEmail: credentials.contactEmail,
          foundationName: credentials.foundationName,
        })
      : null,
  ]);

  return { success: "ok" };
}

export async function submitJobApplicationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const jobId = required(formData.get("job_id"));
  const fullName = required(formData.get("full_name"));
  const email = required(formData.get("email"));
  const phone = required(formData.get("phone"));
  const coverLetter = required(formData.get("cover_letter"));
  const locale = getLocale(required(formData.get("locale")));
  const resume = formData.get("resume");

  if (!jobId || !fullName || !email || !phone || !coverLetter) {
    return { error: "required" };
  }
  if (!isEmail(email)) {
    return { error: "email" };
  }

  if (!isSupabaseConfigured()) {
    return { success: "ok" };
  }

  const supabase = createPublicClient();
  let resumeUrl: string | null = null;

  if (resume instanceof File && resume.size > 0) {
    const extension = resume.name.split(".").pop()?.toLowerCase() || "pdf";
    const path = `resumes/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, resume, {
        cacheControl: "3600",
        upsert: false,
        contentType: resume.type || "application/pdf",
      });
    if (!uploadError) {
      resumeUrl = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
    }
  }

  const { error } = await supabase.from("job_applications").insert({
    job_id: jobId,
    full_name: fullName,
    email,
    phone,
    cover_letter: coverLetter,
    resume_url: resumeUrl,
    status: "pending",
    locale,
  });

  if (error) {
    return { success: "ok" };
  }

  const [{ data: job }, credentials] = await Promise.all([
    supabase.from("job_postings").select("title, title_en").eq("id", jobId).maybeSingle(),
    loadEmailjsCredentials(),
  ]);
  const jobTitle = pickLocalized(locale, job?.title, job?.title_en) || jobId;
  const name = foundationName(
    locale,
    credentials?.foundationName,
    credentials?.foundationNameEn,
  );

  await notifyQuietly([
    careerConfirmationEmail({
      fullName,
      email,
      jobTitle,
      locale,
      foundationName: name,
    }),
    credentials?.contactEmail
      ? careerAdminEmail({
          fullName,
          email,
          phone,
          jobTitle,
          coverLetter,
          resumeUrl,
          adminEmail: credentials.contactEmail,
          foundationName: credentials.foundationName,
        })
      : null,
  ]);

  return { success: "ok" };
}

export async function submitContactAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fullName = required(formData.get("full_name"));
  const email = required(formData.get("email"));
  const message = required(formData.get("message"));
  const locale = getLocale(required(formData.get("locale")));

  if (!fullName || !email || !message) {
    return { error: "required" };
  }
  if (!isEmail(email)) {
    return { error: "email" };
  }

  const credentials = await loadEmailjsCredentials();
  const name = foundationName(
    locale,
    credentials?.foundationName,
    credentials?.foundationNameEn,
  );

  await notifyQuietly([
    contactAutoReplyEmail({
      fullName,
      email,
      message,
      locale,
      foundationName: name,
    }),
    credentials?.contactEmail
      ? contactAdminEmail({
          fullName,
          email,
          message,
          adminEmail: credentials.contactEmail,
          foundationName: credentials.foundationName,
        })
      : null,
  ]);

  return { success: "ok" };
}
