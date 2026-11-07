import { listCauses } from "@/actions/causes";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { CauseManager } from "@/components/admin/cause-manager";

async function AdminCauses() {
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
