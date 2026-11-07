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
    <aside className="hidden h-svh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:flex">
      <div className="border-b border-sidebar-border px-5 py-4">
        <p className="text-sm font-bold tracking-tight">Admin</p>
        {/* <p className="mt-1 text-xs text-muted-foreground">Content &amp; operations</p> */}
      </div>
      <AdminNav menus={menus} />
      <div className="border-t border-sidebar-border p-3">
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
