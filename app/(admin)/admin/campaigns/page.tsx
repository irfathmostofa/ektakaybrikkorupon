import { getCampaignEmailConfig, listCampaigns } from "@/actions/campaigns";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { CampaignManager } from "@/components/admin/campaign-manager";
import { requireMenu } from "@/lib/admin/access";

async function AdminCampaigns() {
  const user = await requireMenu("campaigns");
  const [campaigns, emailConfig] = await Promise.all([
    listCampaigns(),
    getCampaignEmailConfig(),
  ]);

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Campaigns"
        description="Draft, test, and send email campaigns."
      />
      <CampaignManager
        campaigns={campaigns}
        emailConfig={emailConfig}
        senderEmail={user.email}
        senderName={user.full_name || user.email}
      />
    </section>
  );
}

export default function AdminCampaignsPage() {
  return (
    <AdminPage>
      <AdminCampaigns />
    </AdminPage>
  );
}
