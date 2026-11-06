import { Suspense, type ReactNode } from "react";

export function AdminPageFallback() {
  return <div className="h-40 rounded-xl bg-muted" />;
}

export function AdminPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AdminPageFallback />}>{children}</Suspense>;
}
