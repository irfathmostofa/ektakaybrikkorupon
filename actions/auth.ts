"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthState = {
  error?: string;
};

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase environment variables are not configured." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "/admin");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect(nextPath.startsWith("/admin") ? nextPath : "/admin");
}

export async function logoutAction() {
  if (!isSupabaseConfigured()) {
    redirect("/admin/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
