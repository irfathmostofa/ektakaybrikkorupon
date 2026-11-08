"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const drawer = open ? (
    <div id="admin-mobile-sidebar" className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close menu overlay"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin menu"
        className="absolute inset-y-0 left-0 flex h-svh max-h-svh min-h-0 w-[min(18rem,85vw)] max-w-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground shadow-lg"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-sidebar-border px-4 py-3">
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
        <div className="shrink-0 border-t border-sidebar-border p-3">
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
  ) : null;

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="admin-mobile-sidebar"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </Button>
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </div>
  );
}
