"use server";

import { revalidateTag } from "next/cache";
import { CACHE_TAGS, VISIBILITY_KEYS } from "@/lib/constants";
import { requireMenu } from "@/lib/admin/access";
import { parseRoleMenus } from "@/lib/admin/access";
import { isAdminRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SITE_THEME,
  DEFAULT_SITE_VISIBILITY,
  type RoleMenus,
  type SiteSettings,
  type SiteTheme,
  type SiteVisibility,
  type SocialLinks,
  type ThemeMode,
} from "@/lib/types/database";

export type ActionState = {
  error?: string;
  success?: string;
};

function asSettings(data: SiteSettings | null): SiteSettings | null {
  if (!data) {
    return null;
  }
  return {
    ...data,
    social_links: data.social_links ?? {},
    visibility: {
      ...DEFAULT_SITE_VISIBILITY,
      ...(data.visibility ?? {}),
    },
    theme: {
      ...DEFAULT_SITE_THEME,
      ...(data.theme ?? {}),
    },
    role_menus: parseRoleMenus(data.role_menus),
  };
}

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

  return asSettings(data as SiteSettings | null);
}

function parseVisibility(formData: FormData): SiteVisibility {
  const visibility = { ...DEFAULT_SITE_VISIBILITY };
  for (const key of VISIBILITY_KEYS) {
    visibility[key] = formData.get(`visibility_${key}`) === "on";
  }
  return visibility;
}

function parseTheme(formData: FormData): SiteTheme {
  const modeValue = String(formData.get("theme_mode") ?? "light");
  const mode: ThemeMode =
    modeValue === "dark" || modeValue === "system" ? modeValue : "light";
  return {
    primary: String(formData.get("theme_primary") ?? "").trim() || DEFAULT_SITE_THEME.primary,
    secondary:
      String(formData.get("theme_secondary") ?? "").trim() || DEFAULT_SITE_THEME.secondary,
    heading_font:
      String(formData.get("theme_heading_font") ?? "").trim() ||
      DEFAULT_SITE_THEME.heading_font,
    body_font:
      String(formData.get("theme_body_font") ?? "").trim() || DEFAULT_SITE_THEME.body_font,
    mode,
  };
}

export async function updateSiteSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireMenu("settings");

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
    favicon_url: String(formData.get("favicon_url") ?? "").trim() || null,
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
    visibility: parseVisibility(formData),
    theme: parseTheme(formData),
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

export async function updateRoleMenusAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireMenu("users");
  if (user.role !== "super_admin") {
    return { error: "Only super admins can set role menus." };
  }

  const menus: RoleMenus = {
    admin: formData.getAll("admin_menus").map(String),
    editor: formData.getAll("editor_menus").map(String),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ role_menus: menus })
    .eq("id", 1);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(CACHE_TAGS.siteSettings, "max");
  return { success: "Role access saved." };
}

export type SiteSettingsRow = SiteSettings;
