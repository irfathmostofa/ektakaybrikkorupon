import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireStaff } from "@/lib/auth";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Admin");

function AdminShellFallback() {
  return (
    <div className="flex min-h-full flex-1">
      <div className="hidden w-64 border-r border-border bg-card md:block" />
      <div className="flex min-w-0 flex-1 flex-col bg-muted/30">
        <div className="flex-1 p-6 md:p-8">
          <div className="h-40 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await requireStaff();

  return (
    <div className="flex min-h-full flex-1">
      <AdminSidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col bg-muted/30">
        <div className="flex-1 p-6 md:p-8">{children}</div>
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
