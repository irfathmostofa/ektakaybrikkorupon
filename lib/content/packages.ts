import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { DonationPackage } from "@/lib/types/database";

export const FALLBACK_PACKAGES: DonationPackage[] = [
  {
    id: "p30",
    name: "৩০ টাকা",
    name_en: "30 Taka",
    amount: 30,
    description: "এক মাসের এক টাকা করে সঞ্চয়",
    description_en: "One taka a day for a month",
    is_active: true,
    sort_order: 1,
    created_at: "1970-01-01T00:00:00.000Z",
    updated_at: "1970-01-01T00:00:00.000Z",
  },
  {
    id: "p90",
    name: "৯০ টাকা",
    name_en: "90 Taka",
    amount: 90,
    description: "তিন মাসের সঞ্চয়",
    description_en: "Three months of saving",
    is_active: true,
    sort_order: 2,
    created_at: "1970-01-01T00:00:00.000Z",
    updated_at: "1970-01-01T00:00:00.000Z",
  },
  {
    id: "p180",
    name: "১৮০ টাকা",
    name_en: "180 Taka",
    amount: 180,
    description: "ছয় মাসের সঞ্চয়",
    description_en: "Six months of saving",
    is_active: true,
    sort_order: 3,
    created_at: "1970-01-01T00:00:00.000Z",
    updated_at: "1970-01-01T00:00:00.000Z",
  },
  {
    id: "p360",
    name: "৩৬০ টাকা",
    name_en: "360 Taka",
    amount: 360,
    description: "এক বছরের সঞ্চয়",
    description_en: "A year of saving",
    is_active: true,
    sort_order: 4,
    created_at: "1970-01-01T00:00:00.000Z",
    updated_at: "1970-01-01T00:00:00.000Z",
  },
  {
    id: "p1000",
    name: "১০০০ টাকা",
    name_en: "1000 Taka",
    amount: 1000,
    description: "বড় অবদান",
    description_en: "A larger gift",
    is_active: true,
    sort_order: 5,
    created_at: "1970-01-01T00:00:00.000Z",
    updated_at: "1970-01-01T00:00:00.000Z",
  },
];

export async function getActiveDonationPackages(): Promise<DonationPackage[]> {
  "use cache";
  cacheTag(CACHE_TAGS.packages);
  cacheLife("minutes");

  if (!isSupabaseConfigured()) {
    return FALLBACK_PACKAGES;
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("donation_packages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) {
      return FALLBACK_PACKAGES;
    }
    return data;
  } catch {
    return FALLBACK_PACKAGES;
  }
}
