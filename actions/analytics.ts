"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function trackBlogViewAction(slug: string) {
  if (!isSupabaseConfigured() || !slug) {
    return;
  }
  const supabase = createPublicClient();
  await supabase.rpc("increment_blog_view", { post_slug: slug });
}

export async function trackVisitorAction() {
  if (!isSupabaseConfigured()) {
    return;
  }
  const supabase = createPublicClient();
  await supabase.rpc("increment_site_visitors");
}
