import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/actions/settings";
import { requireStaff } from "@/lib/auth";
import { FALLBACK_SITE_SETTINGS } from "@/lib/cache";

export default async function AdminSettingsPage() {
  await requireStaff();
  const settings = await getSiteSettings();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Store SSL Commerz, Email.js, and Google verification values here.
        </p>
      </div>
      <SettingsForm
        settings={
          settings ?? {
            id: 1,
            ...FALLBACK_SITE_SETTINGS,
            sslcommerz_store_id: null,
            sslcommerz_store_password: null,
            sslcommerz_is_live: false,
            emailjs_service_id: null,
            emailjs_template_id: null,
            emailjs_public_key: null,
            emailjs_private_key: null,
            updated_at: new Date().toISOString(),
          }
        }
      />
    </section>
  );
}
