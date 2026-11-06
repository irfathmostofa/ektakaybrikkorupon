import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Admin login");

function LoginFormFallback() {
  return <div className="h-56 rounded-lg bg-muted" />;
}

async function LoginFormFromParams({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/admin") ? params.next : "/admin";

  return <LoginForm nextPath={nextPath} />;
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-24">
      <Card>
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoginFormFallback />}>
            <LoginFormFromParams searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </section>
  );
}
