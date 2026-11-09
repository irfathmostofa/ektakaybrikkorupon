import { listTeamMembers } from "@/actions/team";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { TeamManager } from "@/components/admin/team-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminTeam() {
  await requireMenu("team");
  const members = await listTeamMembers();

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Team"
        description="People shown on the public about page."
      />
      <TeamManager members={members} />
    </section>
  );
}

export default function AdminTeamPage() {
  return (
    <AdminPage>
      <AdminTeam />
    </AdminPage>
  );
}
