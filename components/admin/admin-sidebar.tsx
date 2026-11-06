import Link from "next/link";
import {
  FileText,
  FolderOpen,
  HeartHandshake,
  ImageIcon,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";
import type { User } from "@/lib/types/database";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/causes", label: "Causes", icon: HeartHandshake },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/pages", label: "Pages", icon: FolderOpen },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar({ user }: { user: User }) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-4">
        <p className="text-sm font-semibold tracking-tight">Admin</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
