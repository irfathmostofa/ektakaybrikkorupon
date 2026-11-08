import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AdminMenuKey } from "@/lib/admin/menus";

export type AdminNavCounts = Partial<Record<AdminMenuKey, number>>;

export async function getAdminNavCounts(): Promise<AdminNavCounts> {
  if (!isSupabaseConfigured()) {
    return {};
  }
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("membership_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    return { membership: count ?? 0 };
  } catch {
    return {};
  }
}
