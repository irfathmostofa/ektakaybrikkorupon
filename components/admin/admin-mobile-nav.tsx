"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/admin/logout-button";
import { Button } from "@/components/ui/button";
import type { AdminMenuKey } from "@/lib/admin/menus";
import type { User } from "@/lib/types/database";

export function AdminMobileNav({
  user,
  menus,
}: {
  user: User;
  menus: AdminMenuKey[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-sidebar text-sidebar-foreground shadow-lg">
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
              <p className="text-sm font-semibold">Hope Admin</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
            <AdminNav menus={menus} onNavigate={() => setOpen(false)} />
            <div className="border-t border-sidebar-border p-3">
              <div className="mb-3 min-w-0 rounded-lg bg-sidebar-accent px-3 py-2">
                <p className="truncate text-xs font-medium">{user.email}</p>
                <p className="mt-0.5 text-[11px] capitalize text-muted-foreground">
                  {user.role.replaceAll("_", " ")}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
