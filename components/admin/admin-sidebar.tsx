import type { AdminMenuKey } from "@/lib/admin/menus";
import type { User } from "@/lib/types/database";
import { AdminNav } from "./admin-nav";
import { LogoutButton } from "./logout-button";

export function AdminSidebar({
  user,
  menus,
}: {
  user: User;
  menus: AdminMenuKey[];
}) {
  return (
    <aside className="hidden h-svh max-h-svh min-h-0 w-64 shrink-0 flex-col self-stretch overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="shrink-0 border-b border-sidebar-border px-5 py-4">
        <p className="text-sm font-bold tracking-tight">Admin</p>
      </div>
      <AdminNav menus={menus} />
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="mb-3 min-w-0 rounded-lg bg-sidebar-accent px-3 py-2">
          <p className="truncate text-xs font-medium">{user.email}</p>
          <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">
            {user.role.replaceAll("_", " ")}
          </p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
