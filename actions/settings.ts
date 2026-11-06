"use server";

import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants";
import { requireStaff, isAdminRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings, SocialLinks } from "@/lib/types/database";

export type ActionState = {
  error?: string;
  success?: string;
};

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateSiteSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireStaff();

  if (!isAdminRole(user.role)) {
    return { error: "Only admins can update site settings." };
  }

  const socialLinks: SocialLinks = {
    facebook: String(formData.get("facebook") ?? "").trim() || undefined,
    twitter: String(formData.get("twitter") ?? "").trim() || undefined,
    instagram: String(formData.get("instagram") ?? "").trim() || undefined,
    linkedin: String(formData.get("linkedin") ?? "").trim() || undefined,
    youtube: String(formData.get("youtube") ?? "").trim() || undefined,
  };

  const defaultLocale =
    String(formData.get("default_locale") ?? "bn").trim() === "en" ? "en" : "bn";

  const payload: Partial<SiteSettings> = {
    foundation_name: String(formData.get("foundation_name") ?? "").trim(),
    foundation_name_en:
      String(formData.get("foundation_name_en") ?? "").trim() || null,
    logo_url: String(formData.get("logo_url") ?? "").trim() || null,
    contact_email: String(formData.get("contact_email") ?? "").trim() || null,
    contact_phone: String(formData.get("contact_phone") ?? "").trim() || null,
    address: String(formData.get("address") ?? "").trim() || null,
    address_en: String(formData.get("address_en") ?? "").trim() || null,
    default_locale: defaultLocale,
    social_links: socialLinks,
    sslcommerz_store_id:
      String(formData.get("sslcommerz_store_id") ?? "").trim() || null,
    sslcommerz_store_password:
      String(formData.get("sslcommerz_store_password") ?? "").trim() || null,
    sslcommerz_is_live: formData.get("sslcommerz_is_live") === "on",
    emailjs_service_id:
      String(formData.get("emailjs_service_id") ?? "").trim() || null,
    emailjs_template_id:
      String(formData.get("emailjs_template_id") ?? "").trim() || null,
    emailjs_public_key:
      String(formData.get("emailjs_public_key") ?? "").trim() || null,
    emailjs_private_key:
      String(formData.get("emailjs_private_key") ?? "").trim() || null,
    google_site_verification_code:
      String(formData.get("google_site_verification_code") ?? "").trim() ||
      null,
    meta_title: String(formData.get("meta_title") ?? "").trim() || null,
    meta_title_en: String(formData.get("meta_title_en") ?? "").trim() || null,
    meta_description:
      String(formData.get("meta_description") ?? "").trim() || null,
    meta_description_en:
      String(formData.get("meta_description_en") ?? "").trim() || null,
  };

  if (!payload.foundation_name) {
    return { error: "Foundation name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update(payload)
    .eq("id", 1);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(CACHE_TAGS.siteSettings, "max");
  return { success: "Settings saved." };
}

export type SiteSettingsRow = SiteSettings;
