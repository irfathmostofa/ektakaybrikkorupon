import { handlePaymentIpn } from "@/app/api/payment/route-helpers";

export async function GET(request: Request) {
  return handlePaymentIpn(request);
}

export async function POST(request: Request) {
  return handlePaymentIpn(request);
}
