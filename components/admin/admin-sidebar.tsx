
import { LogoutButton } from "@/components/admin/logout-button";
import type { User } from "@/lib/types/database";
import { AdminNav } from "./admin-nav";

export function AdminSidebar({ user }: { user: User }) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-4">
        <p className="text-sm font-semibold tracking-tight">Admin</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <AdminNav />
      <div className="border-t border-sidebar-border p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
