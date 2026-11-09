import { listPages } from "@/actions/pages";
import { listTeamMembers } from "@/actions/team";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { PageManager } from "@/components/admin/page-manager";
import { TeamManager } from "@/components/admin/team-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminPages() {
  await requireMenu("pages");
  const [pages, team] = await Promise.all([listPages(), listTeamMembers()]);

  return (
    <section className="space-y-10">
      <AdminHeader
        title="Pages"
        description="Edit public page copy section by section. Home and about page content is grouped by hero, story, and more."
      />
      <PageManager pages={pages} />
      <TeamManager members={team} />
    </section>
  );
}

export default function AdminPagesPage() {
  return (
    <AdminPage>
      <AdminPages />
    </AdminPage>
  );
}
