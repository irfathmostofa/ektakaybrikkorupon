import type { User, UserRole } from "@/lib/types/database";

export const ADMIN_MENU_KEYS = [
  "dashboard",
  "causes",
  "blog",
  "pages",
  "gallery",
  "achievements",
  "finance",
  "membership",
  "careers",
  "donations",
  "packages",
  "campaigns",
  "subscribers",
  "users",
  "settings",
] as const;

export type AdminMenuKey = (typeof ADMIN_MENU_KEYS)[number];

export const ADMIN_MENU_LABELS: Record<AdminMenuKey, string> = {
  dashboard: "Dashboard",
  causes: "Causes",
  blog: "Blog",
  pages: "Pages",
  gallery: "Gallery",
  achievements: "Achievements",
  finance: "Finance",
  membership: "Membership",
  careers: "Careers",
  donations: "Donations",
  packages: "Packages",
  campaigns: "Campaigns",
  subscribers: "Subscribers",
  users: "Users",
  settings: "Settings",
};

export const ADMIN_MENU_HREFS: Record<AdminMenuKey, string> = {
  dashboard: "/admin",
  causes: "/admin/causes",
  blog: "/admin/blog",
  pages: "/admin/pages",
  gallery: "/admin/gallery",
  achievements: "/admin/achievements",
  finance: "/admin/finance",
  membership: "/admin/membership",
  careers: "/admin/careers",
  donations: "/admin/donations",
  packages: "/admin/packages",
  campaigns: "/admin/campaigns",
  subscribers: "/admin/subscribers",
  users: "/admin/users",
  settings: "/admin/settings",
};

export const DEFAULT_ROLE_MENUS: Record<UserRole, AdminMenuKey[]> = {
  super_admin: [...ADMIN_MENU_KEYS],
  admin: [
    "dashboard",
    "causes",
    "blog",
    "pages",
    "gallery",
    "achievements",
    "finance",
    "membership",
    "careers",
    "donations",
    "packages",
    "campaigns",
    "subscribers",
    "users",
    "settings",
  ],
  editor: [
    "dashboard",
    "causes",
    "blog",
    "pages",
    "gallery",
    "achievements",
    "membership",
    "careers",
  ],
};

export function sanitizeMenus(value: unknown): AdminMenuKey[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is AdminMenuKey =>
    ADMIN_MENU_KEYS.includes(item as AdminMenuKey),
  );
}

export function menusForRole(
  role: UserRole,
  stored?: Partial<Record<UserRole, readonly string[]>> | null,
) {
  if (role === "super_admin") {
    return [...ADMIN_MENU_KEYS];
  }
  const fromStore = sanitizeMenus(stored?.[role]);
  if (fromStore.length) {
    return fromStore;
  }
  return [...DEFAULT_ROLE_MENUS[role]];
}

export function hasMenuAccess(
  user: Pick<User, "role">,
  menu: AdminMenuKey,
  stored?: Partial<Record<UserRole, readonly string[]>> | null,
) {
  return menusForRole(user.role, stored).includes(menu);
}

export function menuKeyFromPath(pathname: string): AdminMenuKey | null {
  if (pathname === "/admin" || pathname === "/admin/") {
    return "dashboard";
  }
  const match = ADMIN_MENU_KEYS.find((key) => {
    if (key === "dashboard") {
      return false;
    }
    const href = ADMIN_MENU_HREFS[key];
    return pathname === href || pathname.startsWith(`${href}/`);
  });
  return match ?? null;
}
