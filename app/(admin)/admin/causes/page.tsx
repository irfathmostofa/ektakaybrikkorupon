import { listCauses } from "@/actions/causes";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { CauseManager } from "@/components/admin/cause-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminCauses() {
  await requireMenu("causes");
  const causes = await listCauses();

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Causes"
        description="Create and manage fundraising projects."
      />
      <CauseManager causes={causes} />
    </section>
  );
}

export default function AdminCausesPage() {
  return (
    <AdminPage>
      <AdminCauses />
    </AdminPage>
  );
}
