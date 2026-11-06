import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export function createPublicClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error("Supabase public environment variables are not set.");
  }

  return createSupabaseClient<Database>(env.url, env.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
