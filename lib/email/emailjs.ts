import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { FALLBACK_SITE_SETTINGS } from "@/lib/cache";
import type { EmailPayload } from "@/lib/email/templates";

type EmailjsCredentials = {
  serviceId: string;
  templateId: string;
  publicKey: string;
  privateKey: string | null;
  contactEmail: string | null;
  foundationName: string;
  foundationNameEn: string | null;
};

export async function loadEmailjsCredentials(): Promise<EmailjsCredentials | null> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "emailjs_service_id, emailjs_template_id, emailjs_public_key, emailjs_private_key, contact_email, foundation_name, foundation_name_en",
    )
    .eq("id", 1)
    .maybeSingle();

  if (
    error ||
    !data?.emailjs_service_id ||
    !data.emailjs_template_id ||
    !data.emailjs_public_key
  ) {
    return null;
  }

  return {
    serviceId: data.emailjs_service_id,
    templateId: data.emailjs_template_id,
    publicKey: data.emailjs_public_key,
    privateKey: data.emailjs_private_key,
    contactEmail: data.contact_email,
    foundationName: data.foundation_name || FALLBACK_SITE_SETTINGS.foundation_name,
    foundationNameEn:
      data.foundation_name_en || FALLBACK_SITE_SETTINGS.foundation_name_en || null,
  };
}

export async function sendEmailjsMessage(
  payload: EmailPayload,
  credentials?: EmailjsCredentials | null,
): Promise<boolean> {
  const creds = credentials === undefined ? await loadEmailjsCredentials() : credentials;
  if (!creds) {
    return false;
  }

  const body: Record<string, unknown> = {
    service_id: creds.serviceId,
    template_id: creds.templateId,
    user_id: creds.publicKey,
    template_params: {
      to_email: payload.to_email,
      to_name: payload.to_name,
      subject: payload.subject,
      title: payload.title,
      message: payload.message,
      message_html: "",
      reply_to: payload.reply_to || payload.to_email,
      from_name: creds.foundationName,
      unsubscribe_link: "",
    },
  };

  if (creds.privateKey) {
    body.accessToken = creds.privateKey;
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function notifyQuietly(
  payloads: Array<EmailPayload | null | undefined>,
) {
  try {
    const credentials = await loadEmailjsCredentials();
    if (!credentials) {
      return;
    }

    await Promise.all(
      payloads
        .filter((item): item is EmailPayload => Boolean(item?.to_email))
        .map((payload) => sendEmailjsMessage(payload, credentials)),
    );
  } catch {
    return;
  }
}
