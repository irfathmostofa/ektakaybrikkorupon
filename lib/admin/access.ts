import { cache } from "react";
import { redirect } from "next/navigation";
import { requireStaff, isAdminRole } from "@/lib/auth";
import {
  hasMenuAccess,
  menusForRole,
  menuKeyFromPath,
  sanitizeMenus,
  visibleMenus,
  type AdminMenuKey,
} from "@/lib/admin/menus";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { RoleMenus, User, UserRole } from "@/lib/types/database";

export function parseRoleMenus(value: unknown): RoleMenus {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const source = value as Record<string, unknown>;
  const menus: RoleMenus = {};
  for (const role of ["super_admin", "admin", "editor"] as UserRole[]) {
    const list = sanitizeMenus(source[role]);
    if (list.length) {
      menus[role] = list;
    }
  }
  return menus;
}

export const getStoredRoleMenus = cache(async (): Promise<RoleMenus> => {
  if (!isSupabaseConfigured()) {
    return {};
  }
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("role_menus")
      .eq("id", 1)
      .maybeSingle();
    return parseRoleMenus(data?.role_menus);
  } catch {
    return {};
  }
});

export async function requireMenu(menu: AdminMenuKey) {
  const user = await requireStaff();
  if (user.role === "super_admin") {
    return user;
  }
  const stored = await getStoredRoleMenus();
  if (!hasMenuAccess(user, menu, stored)) {
    redirect("/admin");
  }
  return user;
}

export async function requireAdminUser() {
  const user = await requireStaff();
  if (!isAdminRole(user.role)) {
    redirect("/admin");
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireStaff();
  if (user.role !== "super_admin") {
    redirect("/admin");
  }
  return user;
}

export async function getAccessibleMenus(user: User) {
  const stored = await getStoredRoleMenus();
  return visibleMenus(menusForRole(user.role, stored));
}

export async function assertPathAccess(user: User, pathname: string) {
  const key = menuKeyFromPath(pathname);
  if (!key || key === "dashboard") {
    return;
  }
  if (user.role === "super_admin") {
    return;
  }
  const stored = await getStoredRoleMenus();
  if (!hasMenuAccess(user, key, stored)) {
    redirect("/admin");
  }
}
