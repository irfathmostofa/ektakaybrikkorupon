import { listSubscribers } from "@/actions/campaigns";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { SubscriberManager } from "@/components/admin/subscriber-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminSubscribers() {
  await requireMenu("subscribers");
  const subscribers = await listSubscribers();

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Subscribers"
        description="Add, import, and export email subscribers."
      />
      <SubscriberManager subscribers={subscribers} />
    </section>
  );
}

export default function AdminSubscribersPage() {
  return (
    <AdminPage>
      <AdminSubscribers />
    </AdminPage>
  );
}
