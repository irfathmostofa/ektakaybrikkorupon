"use server";

import { revalidateTag } from "next/cache";
import { formHtml, formOptional, formString } from "@/lib/admin/form";
import { requireStaff } from "@/lib/auth";
import { CACHE_TAGS } from "@/lib/constants";
import {
  isHomeSectionKey,
  mergeHomeSections,
  type HomeFeature,
  type HomeSectionKey,
  type HomeSections,
  type HomeStat,
} from "@/lib/content/home-sections";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/actions/settings";

export async function listPages() {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_content")
    .select("*")
    .order("page_key", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getPage(id: string) {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_content")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updatePageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!id || !title) {
    return { error: "Title is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("page_content")
    .update({
      title,
      title_en: String(formData.get("title_en") ?? "").trim() || null,
      subtitle: String(formData.get("subtitle") ?? "").trim() || null,
      subtitle_en: String(formData.get("subtitle_en") ?? "").trim() || null,
      body: formHtml(formData, "body"),
      body_en: formHtml(formData, "body_en"),
      hero_image_url:
        String(formData.get("hero_image_url") ?? "").trim() || null,
      meta_title: String(formData.get("meta_title") ?? "").trim() || null,
      meta_title_en: String(formData.get("meta_title_en") ?? "").trim() || null,
      meta_description:
        String(formData.get("meta_description") ?? "").trim() || null,
      meta_description_en:
        String(formData.get("meta_description_en") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(CACHE_TAGS.pages, "max");
  return { success: "Page content saved." };
}

export async function updatePageSeoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = formString(formData, "id");
  if (!id) {
    return { error: "Page is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("page_content")
    .update({
      hero_image_url: formOptional(formData, "hero_image_url"),
      meta_title: formOptional(formData, "meta_title"),
      meta_title_en: formOptional(formData, "meta_title_en"),
      meta_description: formOptional(formData, "meta_description"),
      meta_description_en: formOptional(formData, "meta_description_en"),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(CACHE_TAGS.pages, "max");
  return { success: "SEO saved." };
}

function indexedValues(formData: FormData, prefix: string) {
  const keys = [...formData.keys()].filter((key) => key.startsWith(`${prefix}_`));
  const indexes = [
    ...new Set(
      keys
        .map((key) => {
          const match = key.match(/_(\d+)$/);
          return match ? Number(match[1]) : NaN;
        })
        .filter((value) => Number.isInteger(value) && value >= 0),
    ),
  ].sort((a, b) => a - b);
  return indexes;
}

function parseStats(formData: FormData): HomeStat[] {
  return indexedValues(formData, "stat").map((index) => {
    const numericRaw = formString(formData, `stat_numeric_${index}`);
    const numeric = numericRaw ? Number(numericRaw) : NaN;
    return {
      value: formString(formData, `stat_value_${index}`),
      value_en: formOptional(formData, `stat_value_en_${index}`),
      label: formString(formData, `stat_label_${index}`),
      label_en: formOptional(formData, `stat_label_en_${index}`),
      numeric: Number.isFinite(numeric) ? numeric : null,
      suffix: formOptional(formData, `stat_suffix_${index}`),
    };
  }).filter((item) => item.label || item.value);
}

function parseFeatures(formData: FormData): HomeFeature[] {
  return indexedValues(formData, "feature").map((index) => ({
    title: formString(formData, `feature_title_${index}`),
    title_en: formOptional(formData, `feature_title_en_${index}`),
    body: formHtml(formData, `feature_body_${index}`) ?? formString(formData, `feature_body_${index}`),
    body_en:
      formHtml(formData, `feature_body_en_${index}`) ??
      formOptional(formData, `feature_body_en_${index}`),
  })).filter((item) => item.title || item.body);
}

function applyHomeSection(
  current: HomeSections,
  section: HomeSectionKey,
  formData: FormData,
): HomeSections {
  if (section === "hero") {
    return {
      ...current,
      hero: {
        eyebrow: formString(formData, "eyebrow"),
        eyebrow_en: formOptional(formData, "eyebrow_en"),
        donate_label: formString(formData, "donate_label"),
        donate_label_en: formOptional(formData, "donate_label_en"),
        work_label: formString(formData, "work_label"),
        work_label_en: formOptional(formData, "work_label_en"),
      },
    };
  }
  if (section === "impact") {
    return {
      ...current,
      impact: {
        heading: formString(formData, "heading"),
        heading_en: formOptional(formData, "heading_en"),
        stats: parseStats(formData),
      },
    };
  }
  if (section === "story") {
    return {
      ...current,
      story: {
        title: formString(formData, "title"),
        title_en: formOptional(formData, "title_en"),
        body: formHtml(formData, "body") ?? formString(formData, "body"),
        body_en: formHtml(formData, "body_en") ?? formOptional(formData, "body_en"),
        image_url: formOptional(formData, "image_url"),
      },
    };
  }
  if (section === "features") {
    return {
      ...current,
      features: {
        eyebrow: formString(formData, "eyebrow"),
        eyebrow_en: formOptional(formData, "eyebrow_en"),
        heading: formString(formData, "heading"),
        heading_en: formOptional(formData, "heading_en"),
        items: parseFeatures(formData),
      },
    };
  }
  if (section === "how") {
    return {
      ...current,
      how: {
        title: formString(formData, "title"),
        title_en: formOptional(formData, "title_en"),
        body: formHtml(formData, "body") ?? formString(formData, "body"),
        body_en: formHtml(formData, "body_en") ?? formOptional(formData, "body_en"),
      },
    };
  }
  if (section === "listings") {
    return {
      ...current,
      listings: {
        causes_eyebrow: formString(formData, "causes_eyebrow"),
        causes_eyebrow_en: formOptional(formData, "causes_eyebrow_en"),
        causes_heading: formString(formData, "causes_heading"),
        causes_heading_en: formOptional(formData, "causes_heading_en"),
        gallery_heading: formString(formData, "gallery_heading"),
        gallery_heading_en: formOptional(formData, "gallery_heading_en"),
        transparency_heading: formString(formData, "transparency_heading"),
        transparency_heading_en: formOptional(formData, "transparency_heading_en"),
      },
    };
  }
  return {
    ...current,
    cta: {
      title: formString(formData, "title"),
      title_en: formOptional(formData, "title_en"),
      body: formHtml(formData, "body") ?? formString(formData, "body"),
      body_en: formHtml(formData, "body_en") ?? formOptional(formData, "body_en"),
      join_label: formString(formData, "join_label"),
      join_label_en: formOptional(formData, "join_label_en"),
      donate_label: formString(formData, "donate_label"),
      donate_label_en: formOptional(formData, "donate_label_en"),
    },
  };
}

export async function updateHomeSectionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireStaff();
  const id = formString(formData, "id");
  const section = formString(formData, "section");
  if (!id || !isHomeSectionKey(section)) {
    return { error: "A valid home section is required." };
  }

  const supabase = await createClient();
  const { data, error: loadError } = await supabase
    .from("page_content")
    .select("sections")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    return { error: loadError.message };
  }

  const next = applyHomeSection(mergeHomeSections(data?.sections), section, formData);
  const heroUpdate =
    section === "hero"
      ? {
          title: formString(formData, "title"),
          title_en: formOptional(formData, "title_en"),
          subtitle: formOptional(formData, "subtitle"),
          subtitle_en: formOptional(formData, "subtitle_en"),
        }
      : {};

  if (section === "hero" && !heroUpdate.title) {
    return { error: "Title is required." };
  }

  const { error } = await supabase
    .from("page_content")
    .update({
      sections: next,
      ...heroUpdate,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidateTag(CACHE_TAGS.pages, "max");
  return { success: "Section saved." };
}
