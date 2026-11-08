import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants";
import { loadEmailjsCredentials, notifyQuietly } from "@/lib/email/emailjs";
import { donationAdminEmail, donationReceiptEmail } from "@/lib/email/templates";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Donation } from "@/lib/types/database";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  isValidGatewayStatus,
  type SslcommerzCredentials,
  validateSslcommerzPayment,
} from "@/lib/payments/sslcommerz";

export type PaymentOutcome = "success" | "failed" | "cancelled";

export async function loadSslcommerzCredentials(): Promise<SslcommerzCredentials | null> {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("sslcommerz_store_id, sslcommerz_store_password, sslcommerz_is_live")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data?.sslcommerz_store_id || !data.sslcommerz_store_password) {
    return null;
  }

  return {
    storeId: data.sslcommerz_store_id,
    storePassword: data.sslcommerz_store_password,
    isLive: Boolean(data.sslcommerz_is_live),
  };
}

async function findDonation(
  supabase: ReturnType<typeof createAdminClient>,
  transactionId: string,
  donationId?: string | null,
) {
  if (transactionId) {
    const byTran = await supabase
      .from("donations")
      .select("*")
      .eq("transaction_id", transactionId)
      .maybeSingle();
    if (byTran.data) {
      return byTran.data as Donation;
    }
  }

  if (donationId) {
    const byId = await supabase
      .from("donations")
      .select("*")
      .eq("id", donationId)
      .maybeSingle();
    if (byId.data) {
      return byId.data as Donation;
    }
  }

  return null;
}

async function recordFinanceCollection(
  supabase: ReturnType<typeof createAdminClient>,
  donation: Donation,
  paymentMethod: string | null,
) {
  if (!donation.transaction_id) {
    return;
  }

  const { data: existing } = await supabase
    .from("finance_entries")
    .select("id")
    .eq("transaction_id", donation.transaction_id)
    .maybeSingle();

  if (existing) {
    return;
  }

  const { data: category } = await supabase
    .from("finance_categories")
    .select("id")
    .eq("kind", "collection")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("finance_entries").insert({
    kind: "collection",
    category_id: category?.id ?? null,
    title: `দান · ${donation.donor_name}`,
    title_en: `Donation · ${donation.donor_name}`,
    description: donation.transaction_id
      ? `লেনদেন ${donation.transaction_id}`
      : null,
    description_en: donation.transaction_id
      ? `Transaction ${donation.transaction_id}`
      : null,
    amount: donation.amount,
    entry_date: new Date().toISOString().slice(0, 10),
    source_or_payee: donation.donor_name,
    is_published: true,
    transaction_id: donation.transaction_id,
  });

  if (error && !error.message.toLowerCase().includes("duplicate")) {
    throw error;
  }

  void paymentMethod;
}

export async function markDonationOutcome(options: {
  transactionId: string;
  donationId?: string | null;
  outcome: PaymentOutcome;
  paymentMethod?: string | null;
  valId?: string | null;
  amount?: string | null;
}) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false as const, reason: "not_configured" };
  }

  const supabase = createAdminClient();
  const donation = await findDonation(
    supabase,
    options.transactionId,
    options.donationId,
  );

  if (!donation) {
    return { ok: false as const, reason: "not_found" };
  }

  if (donation.status === "success") {
    return { ok: true as const, donation, alreadySettled: true };
  }

  if (options.outcome === "success") {
    const credentials = await loadSslcommerzCredentials();
    if (!credentials) {
      return { ok: false as const, reason: "missing_credentials" };
    }
    if (!options.valId) {
      return { ok: false as const, reason: "missing_val_id" };
    }

    const validation = await validateSslcommerzPayment(credentials, options.valId);
    if (!isValidGatewayStatus(validation.status)) {
      return { ok: false as const, reason: "invalid_gateway" };
    }

    const validatedAmount = Number(validation.amount ?? options.amount ?? 0);
    if (
      Number.isFinite(validatedAmount) &&
      Math.abs(validatedAmount - Number(donation.amount)) > 0.5
    ) {
      return { ok: false as const, reason: "amount_mismatch" };
    }

    const { data: updated, error } = await supabase
      .from("donations")
      .update({
        status: "success",
        payment_method:
          options.paymentMethod ||
          validation.card_type ||
          validation.card_brand ||
          donation.payment_method,
      })
      .eq("id", donation.id)
      .neq("status", "success")
      .select("*")
      .maybeSingle();

    if (error) {
      return { ok: false as const, reason: error.message };
    }

    if (!updated) {
      return { ok: true as const, donation, alreadySettled: true };
    }

    const settled = updated as Donation;

    if (donation.cause_id) {
      const { data: cause } = await supabase
        .from("causes_projects")
        .select("raised_amount")
        .eq("id", donation.cause_id)
        .maybeSingle();
      if (cause) {
        await supabase
          .from("causes_projects")
          .update({
            raised_amount: Number(cause.raised_amount) + Number(donation.amount),
          })
          .eq("id", donation.cause_id);
      }
    }

    await recordFinanceCollection(
      supabase,
      settled,
      settled.payment_method,
    );

    revalidateTag(CACHE_TAGS.causes, "max");
    revalidateTag(CACHE_TAGS.finance, "max");

    const emailCreds = await loadEmailjsCredentials();
    const foundationName =
      settled.locale === "en"
        ? emailCreds?.foundationNameEn || emailCreds?.foundationName || "1 Taka Tree Plantation"
        : emailCreds?.foundationName || "১টাকায় বৃক্ষরোপণ";
    void notifyQuietly([
      donationReceiptEmail({
        donorName: settled.donor_name,
        donorEmail: settled.donor_email,
        amount: Number(settled.amount),
        transactionId: settled.transaction_id,
        locale: settled.locale,
        foundationName,
      }),
      emailCreds?.contactEmail
        ? donationAdminEmail({
            donorName: settled.donor_name,
            donorEmail: settled.donor_email,
            donorPhone: settled.donor_phone,
            amount: Number(settled.amount),
            transactionId: settled.transaction_id,
            adminEmail: emailCreds.contactEmail,
            foundationName: emailCreds.foundationName,
          })
        : null,
    ]);

    return { ok: true as const, donation: settled, alreadySettled: false };
  }

  const { error } = await supabase
    .from("donations")
    .update({
      status: options.outcome,
      payment_method: options.paymentMethod ?? donation.payment_method,
    })
    .eq("id", donation.id)
    .eq("status", "pending");

  if (error) {
    return { ok: false as const, reason: error.message };
  }

  return {
    ok: true as const,
    donation: { ...donation, status: options.outcome },
    alreadySettled: false,
  };
}
