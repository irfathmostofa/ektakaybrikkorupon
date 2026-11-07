
import { listMembershipApplications, listMembershipPlans } from "@/actions/membership";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { MembershipManager } from "@/components/admin/membership-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminMembership() {
  await requireMenu("membership");
  const [plans, applications] = await Promise.all([
    listMembershipPlans(),
    listMembershipApplications(),
  ]);
  return (
    <section className="space-y-6">
      <AdminHeader title="Membership" description="Plans and Become a Member applications." />
      <MembershipManager plans={plans} applications={applications} />
    </section>
  );
}

export default function AdminMembershipPage() {
  return (
    <AdminPage>
      <AdminMembership />
    </AdminPage>
  );
}
