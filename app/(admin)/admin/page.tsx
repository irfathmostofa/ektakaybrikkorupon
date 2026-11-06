import { AdminPage } from "@/components/admin/admin-page";
import { StatCard } from "@/components/admin/stat-card";
import { requireStaff } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

async function AdminDashboard() {
  await requireStaff();

  if (!isSupabaseConfigured()) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Add Supabase credentials to `.env.local` to load live stats.
        </p>
      </section>
    );
  }

  const supabase = await createClient();
  const [
    { count: causesCount },
    { count: postsCount },
    { count: donationsCount },
    { data: donationRows },
  ] = await Promise.all([
    supabase.from("causes_projects").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("donations").select("*", { count: "exact", head: true }),
    supabase.from("donations").select("amount, status"),
  ]);

  const raised = (donationRows ?? [])
    .filter((row) => row.status === "success")
    .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of causes, content, and donations.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Causes" value={causesCount ?? 0} />
        <StatCard title="Blog posts" value={postsCount ?? 0} />
        <StatCard title="Donations" value={donationsCount ?? 0} />
        <StatCard
          title="Raised"
          value={raised.toLocaleString(undefined, {
            style: "currency",
            currency: "USD",
          })}
          hint="Successful payments"
        />
      </div>
    </section>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminPage>
      <AdminDashboard />
    </AdminPage>
  );
}
