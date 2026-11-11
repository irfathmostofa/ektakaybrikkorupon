"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthState = {
  error?: string;
  ok?: boolean;
  nextPath?: string;
};

function safeAdminPath(value: string) {
  if (!value.startsWith("/admin") || value.startsWith("/admin/login")) {
    return "/admin";
  }
  return value;
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase environment variables are not configured." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = safeAdminPath(String(formData.get("next") ?? "/admin"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  return { ok: true, nextPath };
}

export async function logoutAction(): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { ok: true, nextPath: "/admin/login" };
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return { ok: true, nextPath: "/admin/login" };
}
