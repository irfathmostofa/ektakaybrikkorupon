import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAccessibleMenus } from "@/lib/admin/access";
import { getAdminNavCounts } from "@/lib/admin/nav-counts";
import { requireStaff } from "@/lib/auth";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Admin");

function SidebarFallback() {
  return (
    <div className="hidden h-full min-h-0 w-64 shrink-0 self-stretch border-r border-border bg-card md:block" />
  );
}

function TopBarFallback() {
  return <div className="h-14 shrink-0 border-b border-border bg-background" />;
}

async function AdminSidebarSlot() {
  const user = await requireStaff();
  const [menus, counts] = await Promise.all([
    getAccessibleMenus(user),
    getAdminNavCounts(),
  ]);
  return <AdminSidebar user={user} menus={menus} counts={counts} />;
}

async function AdminTopBarSlot() {
  const user = await requireStaff();
  const [menus, counts] = await Promise.all([
    getAccessibleMenus(user),
    getAdminNavCounts(),
  ]);
  return <AdminTopBar user={user} menus={menus} counts={counts} />;
}

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-svh max-h-svh min-h-0 min-w-0 flex-1 overflow-hidden">
      <Suspense fallback={<SidebarFallback />}>
        <AdminSidebarSlot />
      </Suspense>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/30">
        <Suspense fallback={<TopBarFallback />}>
          <AdminTopBarSlot />
        </Suspense>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
