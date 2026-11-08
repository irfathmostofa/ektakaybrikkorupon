"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Briefcase,
  FileText,
  FolderOpen,
  Gift,
  HeartHandshake,
  Images,
  LayoutDashboard,
  BookOpen,
  Mail,
  Package,
  Settings,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import {
  ADMIN_MENU_HREFS,
  ADMIN_MENU_LABELS,
  type AdminMenuKey,
} from "@/lib/admin/menus";

const ICONS: Record<AdminMenuKey, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  causes: HeartHandshake,
  blog: FileText,
  pages: FolderOpen,
  gallery: Images,
  achievements: Award,
  finance: Wallet,
  membership: Users,
  careers: Briefcase,
  donations: Gift,
  packages: Package,
  campaigns: Mail,
  subscribers: UserPlus,
  magazines: BookOpen,
  users: Users,
  settings: Settings,
};

export function AdminNav({
  menus,
  onNavigate,
}: {
  menus: AdminMenuKey[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || "/admin";

  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3">
      {menus.map((key) => {
        const href = ADMIN_MENU_HREFS[key];
        const Icon = ICONS[key];
        const active =
          href === "/admin"
            ? pathname === "/admin"
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            prefetch
            onClick={onNavigate}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {ADMIN_MENU_LABELS[key]}
          </Link>
        );
      })}
    </nav>
  );
}
