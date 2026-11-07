
import { listAchievements } from "@/actions/achievements";
import { AchievementManager } from "@/components/admin/achievement-manager";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { requireMenu } from "@/lib/admin/access";

async function AdminAchievements() {
  await requireMenu("achievements");
  const items = await listAchievements();
  return (
    <section className="space-y-6">
      <AdminHeader title="Achievements" description="Impact milestones shown on the public site." />
      <AchievementManager items={items} />
    </section>
  );
}

export default function AdminAchievementsPage() {
  return (
    <AdminPage>
      <AdminAchievements />
    </AdminPage>
  );
}
