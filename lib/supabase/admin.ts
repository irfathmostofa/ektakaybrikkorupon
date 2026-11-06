import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export function createAdminClient() {
  const env = getSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!env || !serviceRoleKey) {
    throw new Error("Supabase service role environment variables are not set.");
  }

  return createClient<Database>(env.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
