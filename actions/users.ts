"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser, requireSuperAdmin, getStoredRoleMenus } from "@/lib/admin/access";
import { formString } from "@/lib/admin/form";
import { USER_ROLES } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { User, UserRole } from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";
import { updateRoleMenusAction } from "@/actions/settings";

function parseRole(value: string): UserRole {
  return USER_ROLES.includes(value as UserRole) ? (value as UserRole) : "editor";
}

export async function listUsers(): Promise<User[]> {
  await requireAdminUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function getRoleMenusForAdmin() {
  const user = await requireAdminUser();
  return {
    current: user,
    menus: await getStoredRoleMenus(),
  };
}

export async function createUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireAdminUser();
  const email = formString(formData, "email").toLowerCase();
  const password = formString(formData, "password");
  const fullName = formString(formData, "full_name");
  const role = parseRole(formString(formData, "role"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (role === "super_admin" && actor.role !== "super_admin") {
    return { error: "Only a super admin can create another super admin." };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error || !data.user) {
      return { error: error?.message ?? "Could not create user." };
    }
    const { error: profileError } = await admin.from("users").upsert({
      id: data.user.id,
      email,
      full_name: fullName || null,
      role,
    });
    if (profileError) {
      return { error: profileError.message };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create user." };
  }

  revalidatePath("/admin/users");
  return { success: "User created." };
}

export async function updateUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const actor = await requireAdminUser();
  const id = formString(formData, "id");
  const fullName = formString(formData, "full_name");
  const role = parseRole(formString(formData, "role"));
  if (!id) {
    return { error: "User is required." };
  }
  if (role === "super_admin" && actor.role !== "super_admin") {
    return { error: "Only a super admin can assign that role." };
  }
  if (id === actor.id && actor.role === "super_admin" && role !== "super_admin") {
    return { error: "You cannot remove your own super admin role." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ full_name: fullName || null, role })
    .eq("id", id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/users");
  return { success: "User updated." };
}

export async function deleteUserAction(formData: FormData) {
  const actor = await requireAdminUser();
  const id = formString(formData, "id");
  if (!id || id === actor.id) {
    throw new Error("You cannot delete this user.");
  }
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/users");
}

export { updateRoleMenusAction };

export async function requireUsersPage() {
  return requireAdminUser();
}

export async function requireRoleMatrix() {
  return requireSuperAdmin();
}
