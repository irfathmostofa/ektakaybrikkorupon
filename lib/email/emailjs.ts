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

function credentialsFromEnv(): EmailjsCredentials | null {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim() || "";
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim() || "";
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim() || "";
  if (!serviceId || !templateId || !publicKey) {
    return null;
  }
  return {
    serviceId,
    templateId,
    publicKey,
    privateKey: process.env.EMAILJS_PRIVATE_KEY?.trim() || null,
    contactEmail: null,
    foundationName: FALLBACK_SITE_SETTINGS.foundation_name,
    foundationNameEn: FALLBACK_SITE_SETTINGS.foundation_name_en || null,
  };
}

export async function loadEmailjsCredentials(): Promise<EmailjsCredentials | null> {
  if (isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "emailjs_service_id, emailjs_template_id, emailjs_public_key, emailjs_private_key, contact_email, foundation_name, foundation_name_en",
      )
      .eq("id", 1)
      .maybeSingle();

    if (
      !error &&
      data?.emailjs_service_id &&
      data.emailjs_template_id &&
      data.emailjs_public_key
    ) {
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
  }

  return credentialsFromEnv();
}

export async function sendEmailjsMessageResult(
  payload: EmailPayload,
  credentials?: EmailjsCredentials | null,
): Promise<{ ok: boolean; error?: string }> {
  const creds = credentials === undefined ? await loadEmailjsCredentials() : credentials;
  if (!creds) {
    return { ok: false, error: "EmailJS is not configured." };
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
      message_html: payload.message_html ?? "",
      reply_to: payload.reply_to || payload.to_email,
      from_name: payload.from_name || creds.foundationName,
      unsubscribe_link: payload.unsubscribe_link ?? "",
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
    if (!response.ok) {
      const detail = (await response.text()).trim().slice(0, 240);
      return {
        ok: false,
        error: detail || `EmailJS ${response.status}`,
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "EmailJS request failed." };
  }
}

export async function sendEmailjsMessage(
  payload: EmailPayload,
  credentials?: EmailjsCredentials | null,
): Promise<boolean> {
  return (await sendEmailjsMessageResult(payload, credentials)).ok;
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
