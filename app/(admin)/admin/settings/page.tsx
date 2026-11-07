import { getSiteSettings } from "@/actions/settings";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPage } from "@/components/admin/admin-page";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireMenu } from "@/lib/admin/access";
import { FALLBACK_SITE_SETTINGS } from "@/lib/cache";

async function AdminSettings() {
  await requireMenu("settings");
  const settings = await getSiteSettings();

  return (
    <section className="space-y-6">
      <AdminHeader
        title="Settings"
        description="General, visibility, theme, and integration credentials."
      />
      <SettingsForm
        settings={
          settings ?? {
            id: 1,
            ...FALLBACK_SITE_SETTINGS,
            default_locale: "bn",
            sslcommerz_store_id: null,
            sslcommerz_store_password: null,
            sslcommerz_is_live: false,
            emailjs_service_id: null,
            emailjs_template_id: null,
            emailjs_public_key: null,
            emailjs_private_key: null,
            role_menus: {},
            updated_at: "1970-01-01T00:00:00.000Z",
          }
        }
      />
    </section>
  );
}

export default function AdminSettingsPage() {
  return (
    <AdminPage>
      <AdminSettings />
    </AdminPage>
  );
}
