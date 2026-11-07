"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireMenu } from "@/lib/admin/access";
import { formHtml, formOptional, formString } from "@/lib/admin/form";
import { CACHE_TAGS, CAMPAIGN_AUDIENCES, CAMPAIGN_STATUSES } from "@/lib/constants";
import { loadEmailjsCredentials } from "@/lib/email/emailjs";
import { getSiteUrl } from "@/lib/payments/site-url";
import { createClient } from "@/lib/supabase/server";
import type {
  CampaignAudience,
  CampaignStatus,
  EmailCampaign,
  EmailSubscriber,
} from "@/lib/types/database";
import type { ActionState } from "@/actions/settings";

function parseAudience(value: string): CampaignAudience {
  return CAMPAIGN_AUDIENCES.includes(value as CampaignAudience)
    ? (value as CampaignAudience)
    : "subscribers";
}

function parseStatus(value: string): CampaignStatus {
  return CAMPAIGN_STATUSES.includes(value as CampaignStatus)
    ? (value as CampaignStatus)
    : "draft";
}

export async function listSubscribers(): Promise<EmailSubscriber[]> {
  await requireMenu("subscribers");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function saveSubscriberAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMenu("subscribers");
  const id = formString(formData, "id");
  const email = formString(formData, "email").toLowerCase();
  if (!email) {
    return { error: "Email is required." };
  }
  const payload = {
    email,
    full_name: formOptional(formData, "full_name"),
    is_active: formData.get("is_active") !== "false",
  };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("email_subscribers").update(payload).eq("id", id)
    : await supabase.from("email_subscribers").insert(payload);
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.subscribers, "max");
  revalidatePath("/admin/subscribers");
  return { success: id ? "Subscriber updated." : "Subscriber added." };
}

export async function deleteSubscriberAction(formData: FormData) {
  await requireMenu("subscribers");
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("email_subscribers").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.subscribers, "max");
  revalidatePath("/admin/subscribers");
}

export async function importSubscribersAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMenu("subscribers");
  const raw = formString(formData, "csv");
  const rows = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!rows.length) {
    return { error: "CSV is empty." };
  }
  const records: { email: string; full_name: string | null }[] = [];
  for (const row of rows) {
    if (/^email/i.test(row)) {
      continue;
    }
    const [emailPart, namePart] = row.split(",").map((part) => part.trim().replace(/^"|"$/g, ""));
    const email = (emailPart ?? "").toLowerCase();
    if (!email.includes("@")) {
      continue;
    }
    records.push({ email, full_name: namePart || null });
  }
  if (!records.length) {
    return { error: "No valid emails found." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("email_subscribers").upsert(records, { onConflict: "email" });
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.subscribers, "max");
  revalidatePath("/admin/subscribers");
  return { success: `Imported ${records.length} subscribers.` };
}

export async function listCampaigns(): Promise<EmailCampaign[]> {
  await requireMenu("campaigns");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_campaigns")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function saveCampaignAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMenu("campaigns");
  const id = formString(formData, "id");
  const name = formString(formData, "name");
  const subject = formString(formData, "subject");
  if (!name || !subject) {
    return { error: "Name and subject are required." };
  }
  const payload = {
    name,
    subject,
    body: formHtml(formData, "body") ?? "",
    audience: parseAudience(formString(formData, "audience")),
    status: parseStatus(formString(formData, "status") || "draft"),
  };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("email_campaigns").update(payload).eq("id", id)
    : await supabase.from("email_campaigns").insert(payload);
  if (error) {
    return { error: error.message };
  }
  revalidateTag(CACHE_TAGS.campaigns, "max");
  revalidatePath("/admin/campaigns");
  return { success: id ? "Campaign updated." : "Campaign saved." };
}

export async function deleteCampaignAction(formData: FormData) {
  await requireMenu("campaigns");
  const id = formString(formData, "id");
  const supabase = await createClient();
  const { error } = await supabase.from("email_campaigns").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidateTag(CACHE_TAGS.campaigns, "max");
  revalidatePath("/admin/campaigns");
}

export type CampaignRecipient = {
  email: string;
  name: string;
};

export async function listCampaignRecipients(audience: CampaignAudience) {
  await requireMenu("campaigns");
  const supabase = await createClient();
  const recipients = new Map<string, CampaignRecipient>();

  if (audience === "subscribers" || audience === "both") {
    const { data } = await supabase
      .from("email_subscribers")
      .select("email, full_name")
      .eq("is_active", true);
    for (const row of data ?? []) {
      recipients.set(row.email.toLowerCase(), {
        email: row.email,
        name: row.full_name || row.email,
      });
    }
  }

  if (audience === "members" || audience === "both") {
    const { data } = await supabase
      .from("membership_applications")
      .select("email, full_name")
      .eq("status", "approved");
    for (const row of data ?? []) {
      recipients.set(row.email.toLowerCase(), {
        email: row.email,
        name: row.full_name || row.email,
      });
    }
  }

  return [...recipients.values()];
}

export async function getCampaignEmailConfig() {
  await requireMenu("campaigns");
  const fromEnv = {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim() || "",
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim() || "",
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim() || "",
  };
  if (fromEnv.serviceId && fromEnv.templateId && fromEnv.publicKey) {
    return { ...fromEnv, source: "env" as const };
  }
  const creds = await loadEmailjsCredentials();
  if (!creds) {
    return null;
  }
  return {
    serviceId: creds.serviceId,
    templateId: creds.templateId,
    publicKey: creds.publicKey,
    source: "settings" as const,
  };
}

export async function recordCampaignSendAction(formData: FormData): Promise<ActionState> {
  await requireMenu("campaigns");
  const id = formString(formData, "id");
  const sent = Number(formData.get("sent_count") ?? 0);
  const failed = Number(formData.get("failed_count") ?? 0);
  const total = Number(formData.get("recipient_count") ?? sent + failed);
  if (!id) {
    return { error: "Campaign is required." };
  }
  const status: CampaignStatus =
    failed > 0 && sent > 0 ? "partially_failed" : failed > 0 ? "partially_failed" : "sent";
  const supabase = await createClient();
  const { error } = await supabase
    .from("email_campaigns")
    .update({
      status,
      sent_count: sent,
      failed_count: failed,
      recipient_count: total,
      sent_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    return { error: error.message };
  }
  revalidatePath("/admin/campaigns");
  return { success: "Send results saved." };
}

export async function campaignUnsubscribeUrl(email: string) {
  return `${getSiteUrl()}/contact?unsubscribe=${encodeURIComponent(email)}`;
}
