import { listMagazines } from "@/actions/magazines";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { MagazineManager } from "@/components/admin/magazine-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminMagazines() {
  await requireMenu("magazines");
  const items = await listMagazines();
  return (
    <section className="space-y-6">
      <AdminHeader
        title="Magazines"
        description="Upload PDF issues for visitors to read online and download."
      />
      <MagazineManager items={items} />
    </section>
  );
}

export default function AdminMagazinesPage() {
  return (
    <AdminPage>
      <AdminMagazines />
    </AdminPage>
  );
}
