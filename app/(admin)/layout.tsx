import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminTopBar } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAccessibleMenus } from "@/lib/admin/access";
import { requireStaff } from "@/lib/auth";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Admin");

function AdminShellFallback() {
  return (
    <div className="flex min-h-full flex-1">
      <div className="hidden w-64 border-r border-border bg-card md:block" />
      <div className="flex min-w-0 flex-1 flex-col bg-muted/30">
        <div className="h-14 border-b border-border bg-background" />
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="h-40 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const menus = await getAccessibleMenus(user);

  return (
    <div className="flex min-h-full min-w-0 flex-1">
      <AdminSidebar user={user} menus={menus} />
      <div className="flex min-w-0 flex-1 flex-col bg-muted/30">
        <AdminTopBar user={user} menus={menus} />
        <div className="flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminShellFallback />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
