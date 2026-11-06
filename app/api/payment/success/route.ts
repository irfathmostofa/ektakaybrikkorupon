import { handlePaymentCallback } from "@/app/api/payment/route-helpers";

export async function GET(request: Request) {
  return handlePaymentCallback(request, "success");
}

export async function POST(request: Request) {
  return handlePaymentCallback(request, "success");
}
