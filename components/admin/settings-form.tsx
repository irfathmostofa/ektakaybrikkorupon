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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { THEME_FONTS, VISIBILITY_KEYS } from "@/lib/constants";
import { DEFAULT_SITE_THEME, DEFAULT_SITE_VISIBILITY, type SiteSettings } from "@/lib/types/database";

const initialState: ActionState = {};

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
      />
    </div>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction] = useActionState(
    updateSiteSettingsAction,
    initialState,
  );
  const social = settings.social_links ?? {};
  const visibility = { ...DEFAULT_SITE_VISIBILITY, ...(settings.visibility ?? {}) };
  const theme = { ...DEFAULT_SITE_THEME, ...(settings.theme ?? {}) };

  return (
    <form action={formAction} className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field
                label="Foundation name (Bangla)"
                name="foundation_name"
                defaultValue={settings.foundation_name}
                required
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
                  label="Logo"
                  defaultValue={settings.logo_url}
                />
              </div>
              <div className="md:col-span-2">
                <ImageField
                  name="favicon_url"
                  label="Favicon"
                  defaultValue={settings.favicon_url}
                />
              </div>
              <div className="md:col-span-2">
                <ImageField
                  name="og_image_url"
                  label="SEO / OG image"
                  defaultValue={settings.og_image_url}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Used for social sharing. If empty, the logo image is used.
                </p>
              </div>
              <Field label="Facebook" name="facebook" defaultValue={social.facebook} />
              <Field label="Twitter" name="twitter" defaultValue={social.twitter} />
              <Field label="Instagram" name="instagram" defaultValue={social.instagram} />
              <Field label="LinkedIn" name="linkedin" defaultValue={social.linkedin} />
              <Field label="YouTube" name="youtube" defaultValue={social.youtube} />
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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="meta_description">Meta description (Bangla)</Label>
                <Textarea
                  id="meta_description"
                  name="meta_description"
                  defaultValue={settings.meta_description ?? ""}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="meta_description_en">Meta description (English)</Label>
                <Textarea
                  id="meta_description_en"
                  name="meta_description_en"
                  defaultValue={settings.meta_description_en ?? ""}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visibility">
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {VISIBILITY_KEYS.map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm capitalize">
                  <input
                    type="checkbox"
                    name={`visibility_${key}`}
                    defaultChecked={visibility[key]}
                  />
                  Show {key}
                </label>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="theme_primary">Primary color</Label>
                <Input
                  id="theme_primary"
                  name="theme_primary"
                  defaultValue={theme.primary}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme_secondary">Secondary color</Label>
                <Input
                  id="theme_secondary"
                  name="theme_secondary"
                  defaultValue={theme.secondary}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme_heading_font">Heading font</Label>
                <select
                  id="theme_heading_font"
                  name="theme_heading_font"
                  defaultValue={theme.heading_font}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {THEME_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme_body_font">Body font</Label>
                <select
                  id="theme_body_font"
                  name="theme_body_font"
                  defaultValue={theme.body_font}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {THEME_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme_mode">Mode</Label>
                <select
                  id="theme_mode"
                  name="theme_mode"
                  defaultValue={theme.mode}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
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
        </TabsContent>
      </Tabs>

      <FormMessage state={state} />
      <SubmitButton>Save settings</SubmitButton>
    </form>
  );
}
