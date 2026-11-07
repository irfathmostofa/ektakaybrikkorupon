import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import {
  DEFAULT_SITE_THEME,
  DEFAULT_SITE_VISIBILITY,
  type PublicSiteSettings,
} from "@/lib/types/database";

export const FALLBACK_SITE_SETTINGS: PublicSiteSettings = {
  logo_url: null,
  foundation_name: "১টাকায় বৃক্ষরোপণ",
  foundation_name_en: "1 Taka Tree Plantation",
  contact_email: "ektakaybrikkhoropon@gmail.com",
  contact_phone: "+88018 43 048666",
  address:
    "ব্লক ২, হাজী আবুল কালাম ভবনের নিচ তলা, হাটহাজারী, চট্টগ্রাম বিশ্ববিদ্যালয়, চট্টগ্রাম",
  address_en:
    "Block 2, ground floor of Haji Abul Kalam Bhaban, Hathazari, University of Chittagong, Chattogram",
  social_links: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
  },
  google_site_verification_code: null,
  meta_title: "১টাকায় বৃক্ষরোপণ",
  meta_title_en: "1 Taka Tree Plantation",
  meta_description:
    "প্রতিদিন এক টাকা, মাসে একটি গাছ। ২০১৯ সাল থেকে পরিবেশ ও মানবতার সেবায় নিয়োজিত।",
  meta_description_en:
    "One taka a day, one tree a month. Serving the environment and humanity since 2019.",
  favicon_url: null,
  visitor_count: 0,
  visibility: DEFAULT_SITE_VISIBILITY,
  theme: DEFAULT_SITE_THEME,
};

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  "use cache";
  cacheTag(CACHE_TAGS.siteSettings);
  cacheLife("hours");

  if (!isSupabaseConfigured()) {
    return FALLBACK_SITE_SETTINGS;
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings_public")
    .select(
      "logo_url, foundation_name, foundation_name_en, contact_email, contact_phone, address, address_en, social_links, google_site_verification_code, meta_title, meta_title_en, meta_description, meta_description_en, favicon_url, visitor_count, visibility, theme",
    )
    .maybeSingle();

  if (error || !data) {
    return FALLBACK_SITE_SETTINGS;
  }

  return {
    ...FALLBACK_SITE_SETTINGS,
    ...data,
    visibility: {
      ...DEFAULT_SITE_VISIBILITY,
      ...(data.visibility ?? {}),
    },
    theme: {
      ...DEFAULT_SITE_THEME,
      ...(data.theme ?? {}),
    },
  };
}
