import { ExternalLink } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { Badge } from "@/components/ui/badge";
import type { AdminMenuKey } from "@/lib/admin/menus";
import type { AdminNavCounts } from "@/lib/admin/nav-counts";
import type { User } from "@/lib/types/database";

function roleLabel(role: User["role"]) {
  return role.replaceAll("_", " ");
}

export function AdminTopBar({
  user,
  menus,
  counts,
}: {
  user: User;
  menus: AdminMenuKey[];
  counts?: AdminNavCounts;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur-sm sm:gap-3 sm:px-6">
      <AdminMobileNav user={user} menus={menus} counts={counts} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.email}</p>
        <p className="truncate text-xs capitalize text-muted-foreground">
          {roleLabel(user.role)}
        </p>
      </div>
      <Badge variant="secondary" className="hidden capitalize sm:inline-flex">
        {roleLabel(user.role)}
      </Badge>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm hover:bg-muted"
      >
        <ExternalLink className="size-3.5" />
        <span className="hidden sm:inline">View Website</span>
        <span className="sm:hidden">Site</span>
      </a>
      <div className="hidden md:block">
        <LogoutButton compact />
      </div>
    </header>
  );
}

export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
