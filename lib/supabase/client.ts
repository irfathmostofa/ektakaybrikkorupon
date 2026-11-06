"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export function createClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error("Supabase public environment variables are not set.");
  }

  return createBrowserClient<Database>(env.url, env.anonKey);
}
