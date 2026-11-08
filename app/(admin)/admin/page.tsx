import { getBlogAnalytics } from "@/actions/blog";
import { listFinanceEntries } from "@/actions/finance";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { StatCard } from "@/components/admin/stat-card";
import { requireStaff } from "@/lib/auth";
import { formatAdminNumber } from "@/lib/i18n/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

async function AdminDashboard() {
  await requireStaff();

  if (!isSupabaseConfigured()) {
    return (
      <section className="space-y-4">
        <AdminHeader title="Dashboard" />
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
    { count: galleryCount },
    { count: magazinesCount },
    { count: pendingMembers },
    { count: openJobs },
    analytics,
    entries,
  ] = await Promise.all([
    supabase.from("causes_projects").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("gallery_images").select("*", { count: "exact", head: true }),
    supabase.from("magazines").select("*", { count: "exact", head: true }),
    supabase
      .from("membership_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("job_postings")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true),
    getBlogAnalytics(),
    listFinanceEntries(),
  ]);

  const collected = entries
    .filter((row) => row.kind === "collection")
    .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const spent = entries
    .filter((row) => row.kind === "expense")
    .reduce((sum, row) => sum + Number(row.amount ?? 0), 0);

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Dashboard"
        description="Overview of content, visitors, and the public ledger."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Causes" value={causesCount ?? 0} />
        <StatCard title="Blog posts" value={postsCount ?? 0} />
        <StatCard title="Total reads" value={analytics.totalReads} />
        <StatCard title="Total visitors" value={analytics.totalVisitors} />
        <StatCard title="Gallery images" value={galleryCount ?? 0} />
        <StatCard title="Magazines" value={magazinesCount ?? 0} />
        <StatCard title="Pending members" value={pendingMembers ?? 0} />
        <StatCard title="Open jobs" value={openJobs ?? 0} />
        <StatCard
          title="Balance"
          value={formatAdminNumber(collected - spent)}
          hint={`Collected ${formatAdminNumber(collected)} · Spent ${formatAdminNumber(spent)}`}
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
