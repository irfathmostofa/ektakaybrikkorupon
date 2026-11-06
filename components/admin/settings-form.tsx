"use client";

import { useActionState } from "react";
import { updateSiteSettingsAction, type ActionState } from "@/actions/settings";
import { FormMessage } from "@/components/admin/form-message";
import { ImageField } from "@/components/admin/image-field";
import { SubmitButton } from "@/components/admin/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@/lib/types/database";

const initialState: ActionState = {};

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
      />
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(
    updateSiteSettingsAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field
            label="Foundation name (Bangla)"
            name="foundation_name"
            defaultValue={settings.foundation_name}
          />
          <Field
            label="Foundation name (English)"
            name="foundation_name_en"
            defaultValue={settings.foundation_name_en}
          />
          <Field
            label="Contact email"
            name="contact_email"
            type="email"
            defaultValue={settings.contact_email}
          />
          <Field
            label="Contact phone"
            name="contact_phone"
            defaultValue={settings.contact_phone}
          />
          <Field label="Address (Bangla)" name="address" defaultValue={settings.address} />
          <Field
            label="Address (English)"
            name="address_en"
            defaultValue={settings.address_en}
          />
          <div className="space-y-2">
            <Label htmlFor="default_locale">Default locale</Label>
            <select
              id="default_locale"
              name="default_locale"
              defaultValue={settings.default_locale ?? "bn"}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="bn">Bangla (bn)</option>
              <option value="en">English (en)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <ImageField
              name="logo_url"
              label="Logo URL"
              defaultValue={settings.logo_url}
            />
          </div>
          <Field
            label="Facebook"
            name="facebook"
            defaultValue={settings.social_links.facebook}
          />
          <Field
            label="Twitter"
            name="twitter"
            defaultValue={settings.social_links.twitter}
          />
          <Field
            label="Instagram"
            name="instagram"
            defaultValue={settings.social_links.instagram}
          />
          <Field
            label="LinkedIn"
            name="linkedin"
            defaultValue={settings.social_links.linkedin}
          />
          <Field
            label="YouTube"
            name="youtube"
            defaultValue={settings.social_links.youtube}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field
            label="Meta title (Bangla)"
            name="meta_title"
            defaultValue={settings.meta_title}
          />
          <Field
            label="Meta title (English)"
            name="meta_title_en"
            defaultValue={settings.meta_title_en}
          />
          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta description (Bangla)</Label>
            <Textarea
              id="meta_description"
              name="meta_description"
              defaultValue={settings.meta_description ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta_description_en">Meta description (English)</Label>
            <Textarea
              id="meta_description_en"
              name="meta_description_en"
              defaultValue={settings.meta_description_en ?? ""}
            />
          </div>
          <Field
            label="Google site verification code"
            name="google_site_verification_code"
            defaultValue={settings.google_site_verification_code}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SSL Commerz</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field
            label="Store ID"
            name="sslcommerz_store_id"
            defaultValue={settings.sslcommerz_store_id}
          />
          <Field
            label="Store password"
            name="sslcommerz_store_password"
            type="password"
            defaultValue={settings.sslcommerz_store_password}
          />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              name="sslcommerz_is_live"
              defaultChecked={settings.sslcommerz_is_live}
            />
            Live mode
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email.js</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field
            label="Service ID"
            name="emailjs_service_id"
            defaultValue={settings.emailjs_service_id}
          />
          <Field
            label="Template ID"
            name="emailjs_template_id"
            defaultValue={settings.emailjs_template_id}
          />
          <Field
            label="Public key"
            name="emailjs_public_key"
            defaultValue={settings.emailjs_public_key}
          />
          <Field
            label="Private key"
            name="emailjs_private_key"
            type="password"
            defaultValue={settings.emailjs_private_key}
          />
        </CardContent>
      </Card>

      <FormMessage state={state} />
      <SubmitButton>Save settings</SubmitButton>
    </form>
  );
}
