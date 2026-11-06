import { getSiteUrl } from "@/lib/payments/site-url";

export type SslcommerzCredentials = {
  storeId: string;
  storePassword: string;
  isLive: boolean;
};

export type SslcommerzSessionInput = {
  credentials: SslcommerzCredentials;
  transactionId: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorAddress?: string | null;
  productName: string;
  donationId: string;
  locale: string;
};

export type SslcommerzValidation = {
  status: string;
  tran_id?: string;
  val_id?: string;
  amount?: string;
  currency?: string;
  card_type?: string;
  card_brand?: string;
  store_amount?: string;
};

const SESSION_PATH = "/gwprocess/v4/api.php";
const VALIDATE_PATH = "/validator/api/validationserverAPI.php";

function gatewayHost(isLive: boolean) {
  return isLive
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";
}

async function postForm(url: string, body: URLSearchParams) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    throw new Error(`SSL Commerz request failed (${response.status})`);
  }
  return response.json();
}

export async function createSslcommerzSession(input: SslcommerzSessionInput) {
  const siteUrl = getSiteUrl();
  const params = new URLSearchParams({
    store_id: input.credentials.storeId,
    store_passwd: input.credentials.storePassword,
    total_amount: input.amount.toFixed(2),
    currency: "BDT",
    tran_id: input.transactionId,
    success_url: `${siteUrl}/api/payment/success`,
    fail_url: `${siteUrl}/api/payment/fail`,
    cancel_url: `${siteUrl}/api/payment/cancel`,
    ipn_url: `${siteUrl}/api/payment/ipn`,
    cus_name: input.donorName,
    cus_email: input.donorEmail,
    cus_add1: input.donorAddress || "Dhaka",
    cus_add2: "N/A",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1200",
    cus_country: "Bangladesh",
    cus_phone: input.donorPhone,
    shipping_method: "NO",
    num_of_item: "1",
    product_name: input.productName.slice(0, 120) || "Donation",
    product_category: "Donation",
    product_profile: "non-physical-goods",
    value_a: input.donationId,
    value_b: input.locale,
    emi_option: "0",
  });

  const data = (await postForm(
    `${gatewayHost(input.credentials.isLive)}${SESSION_PATH}`,
    params,
  )) as { status?: string; GatewayPageURL?: string; failedreason?: string };

  if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
    throw new Error(data.failedreason || "Unable to start payment session");
  }

  return data.GatewayPageURL;
}

export async function validateSslcommerzPayment(
  credentials: SslcommerzCredentials,
  valId: string,
) {
  const url = new URL(`${gatewayHost(credentials.isLive)}${VALIDATE_PATH}`);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", credentials.storeId);
  url.searchParams.set("store_passwd", credentials.storePassword);
  url.searchParams.set("format", "json");

  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    throw new Error(`SSL Commerz validation failed (${response.status})`);
  }

  return (await response.json()) as SslcommerzValidation;
}

export function isValidGatewayStatus(status: string | undefined) {
  const value = (status || "").toUpperCase();
  return value === "VALID" || value === "VALIDATED";
}

export async function parseGatewayPayload(request: Request) {
  const url = new URL(request.url);
  const payload: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    payload[key] = value;
  });

  if (request.method === "GET") {
    return payload;
  }

  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const json = (await request.json()) as Record<string, unknown>;
      for (const [key, value] of Object.entries(json)) {
        if (value != null) {
          payload[key] = String(value);
        }
      }
      return payload;
    }

    const form = await request.formData();
    form.forEach((value, key) => {
      payload[key] = String(value);
    });
  } catch {
    return payload;
  }

  return payload;
}
