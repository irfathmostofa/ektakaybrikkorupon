import { NextResponse } from "next/server";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/payments/site-url";
import { parseGatewayPayload } from "@/lib/payments/sslcommerz";
import {
  markDonationOutcome,
  type PaymentOutcome,
} from "@/lib/payments/fulfill";

function localeFromPayload(payload: Record<string, string>): Locale {
  return payload.value_b === "en" ? "en" : "bn";
}

export async function handlePaymentCallback(
  request: Request,
  outcome: PaymentOutcome,
) {
  const payload = await parseGatewayPayload(request);
  const transactionId = payload.tran_id || "";
  const donationId = payload.value_a || null;
  const locale = localeFromPayload(payload);

  let settled: PaymentOutcome = outcome;

  if (transactionId) {
    try {
      const result = await markDonationOutcome({
        transactionId,
        donationId,
        outcome,
        paymentMethod: payload.card_type || payload.card_brand || null,
        valId: payload.val_id || null,
        amount: payload.amount || payload.store_amount || null,
      });
      if (outcome === "success" && !result.ok) {
        settled = "failed";
      }
    } catch {
      if (outcome === "success") {
        settled = "failed";
      }
    }
  } else if (outcome === "success") {
    settled = "failed";
  }

  const path =
    settled === "success"
      ? `/donate/success?tran_id=${encodeURIComponent(transactionId)}`
      : settled === "failed"
        ? `/donate/fail?tran_id=${encodeURIComponent(transactionId)}`
        : `/donate/cancel?tran_id=${encodeURIComponent(transactionId)}`;

  return NextResponse.redirect(
    `${getSiteUrl()}${localizeHref(locale, path)}`,
    303,
  );
}

export async function handlePaymentIpn(request: Request) {
  const payload = await parseGatewayPayload(request);
  const transactionId = payload.tran_id || "";
  const status = (payload.status || "").toUpperCase();

  if (!transactionId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const outcome: PaymentOutcome =
    status === "VALID" || status === "VALIDATED" || status === "SUCCESS"
      ? "success"
      : status === "CANCELLED" || status === "UNATTEMPTED"
        ? "cancelled"
        : "failed";

  try {
    const result = await markDonationOutcome({
      transactionId,
      donationId: payload.value_a || null,
      outcome,
      paymentMethod: payload.card_type || payload.card_brand || null,
      valId: payload.val_id || null,
      amount: payload.amount || payload.store_amount || null,
    });
    return NextResponse.json({ ok: result.ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
