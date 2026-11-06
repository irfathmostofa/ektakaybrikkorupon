import { handlePaymentCallback } from "@/app/api/payment/route-helpers";

export async function GET(request: Request) {
  return handlePaymentCallback(request, "failed");
}

export async function POST(request: Request) {
  return handlePaymentCallback(request, "failed");
}
