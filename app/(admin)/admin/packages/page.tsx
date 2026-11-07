import { listDonationPackages } from "@/actions/donations";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { PackageManager } from "@/components/admin/package-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminPackages() {
  await requireMenu("packages");
  const packages = await listDonationPackages();

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Donation packages"
        description="Amounts shown on the public donate page."
      />
      <PackageManager packages={packages} />
    </section>
  );
}

export default function AdminPackagesPage() {
  return (
    <AdminPage>
      <AdminPackages />
    </AdminPage>
  );
}
