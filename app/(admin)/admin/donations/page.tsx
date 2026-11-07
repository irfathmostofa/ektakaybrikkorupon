import { listCauses } from "@/actions/causes";
import { listDonationPackages, listDonations } from "@/actions/donations";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { DonationManager } from "@/components/admin/donation-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminDonations() {
  await requireMenu("donations");
  const [donations, packages, causes] = await Promise.all([
    listDonations(),
    listDonationPackages(),
    listCauses(),
  ]);

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Donations"
        description="Search, filter, and manage donor records."
      />
      <DonationManager donations={donations} packages={packages} causes={causes} />
    </section>
  );
}

export default function AdminDonationsPage() {
  return (
    <AdminPage>
      <AdminDonations />
    </AdminPage>
  );
}
