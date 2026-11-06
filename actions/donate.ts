"use server";

import { FALLBACK_CAUSES } from "@/lib/content/fallbacks";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { createAdminClient } from "@/lib/supabase/admin";
import { pickLocalized } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import {
  createTransactionId,
  donationInputSchema,
  parseCauseId,
} from "@/lib/payments/schema";
import {
  createSslcommerzSession,
} from "@/lib/payments/sslcommerz";
import { loadSslcommerzCredentials } from "@/lib/payments/fulfill";

export type DonateActionState = {
  error?: string;
  gatewayUrl?: string;
};

export async function initiateDonationAction(
  input: unknown,
): Promise<DonateActionState> {
  const raw =
    input && typeof input === "object"
      ? {
          ...(input as Record<string, unknown>),
          amount: Number((input as { amount?: unknown }).amount),
          cause_id:
            String((input as { cause_id?: unknown }).cause_id ?? "").trim() ||
            undefined,
          donor_address:
            String((input as { donor_address?: unknown }).donor_address ?? "").trim() ||
            undefined,
          message:
            String((input as { message?: unknown }).message ?? "").trim() ||
            undefined,
        }
      : input;
  const parsed = donationInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "invalid" };
  }

  const values = parsed.data;
  const locale = values.locale as Locale;
  const credentials = await loadSslcommerzCredentials();

  if (!credentials) {
    return { error: "gateway" };
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "gateway" };
  }

  let causeTitle = locale === "en" ? "General donation" : "সাধারণ দান";
  let causeId = parseCauseId(values.cause_id);

  if (values.cause_id && !causeId) {
    const fallback = FALLBACK_CAUSES.find((item) => item.id === values.cause_id);
    if (fallback) {
      causeTitle = pickLocalized(locale, fallback.title, fallback.title_en);
      causeId = null;
    }
  }

  if (causeId) {
    const publicClient = createPublicClient();
    const { data: cause } = await publicClient
      .from("causes_projects")
      .select("id, title, title_en, status")
      .eq("id", causeId)
      .maybeSingle();

    if (!cause || !["active", "completed"].includes(cause.status)) {
      return { error: "cause" };
    }

    causeTitle = pickLocalized(locale, cause.title, cause.title_en);
  }

  const transactionId = createTransactionId();
  const admin = createAdminClient();
  const { data: donation, error } = await admin
    .from("donations")
    .insert({
      donor_name: values.donor_name,
      donor_email: values.donor_email,
      donor_phone: values.donor_phone,
      donor_address: values.donor_address ?? null,
      message: values.message ?? null,
      amount: values.amount,
      transaction_id: transactionId,
      cause_id: causeId,
      status: "pending",
      locale,
    })
    .select("id")
    .single();

  if (error || !donation) {
    return { error: "save" };
  }

  try {
    const gatewayUrl = await createSslcommerzSession({
      credentials,
      transactionId,
      amount: values.amount,
      donorName: values.donor_name,
      donorEmail: values.donor_email,
      donorPhone: values.donor_phone,
      donorAddress: values.donor_address,
      productName: causeTitle,
      donationId: donation.id,
      locale,
    });
    return { gatewayUrl };
  } catch {
    await admin
      .from("donations")
      .update({ status: "failed" })
      .eq("id", donation.id);
    return { error: "gateway" };
  }
}
