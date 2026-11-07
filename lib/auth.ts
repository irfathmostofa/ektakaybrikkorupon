import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { User } from "@/lib/types/database";

export async function getCurrentUser(): Promise<User | null> {
  await connection();

  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (data) {
    return data;
  }

  await supabase.auth.signOut();
  return null;
}

export async function requireStaff() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

export function isAdminRole(role: User["role"]) {
  return role === "super_admin" || role === "admin";
}

export function isSuperAdmin(role: User["role"]) {
  return role === "super_admin";
}
