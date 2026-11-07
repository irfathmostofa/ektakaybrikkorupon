"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Briefcase,
  FileText,
  FolderOpen,
  HeartHandshake,
  ImageIcon,
  Images,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/causes", label: "Causes", icon: HeartHandshake },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/pages", label: "Pages", icon: FolderOpen },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/achievements", label: "Achievements", icon: Award },
  { href: "/admin/finance", label: "Finance", icon: Wallet },
  { href: "/admin/membership", label: "Membership", icon: Users },
  { href: "/admin/careers", label: "Careers", icon: Briefcase },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminNav() {
  const pathname = usePathname() || "/admin";

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
