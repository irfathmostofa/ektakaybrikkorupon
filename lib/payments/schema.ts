import { z } from "zod";

export const donationInputSchema = z.object({
  amount: z.number().finite().min(10).max(10_000_000),
  cause_id: z.string().max(80).optional(),
  package_id: z.string().max(80).optional(),
  donor_name: z.string().trim().min(2).max(120),
  donor_email: z.string().trim().email().max(160),
  donor_phone: z.string().trim().min(8).max(20),
  donor_address: z.string().trim().max(250).optional(),
  message: z.string().trim().max(500).optional(),
  locale: z.enum(["bn", "en"]),
});

export type DonationInput = z.infer<typeof donationInputSchema>;

export function parseCauseId(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuid.test(value) ? value : null;
}

export function createTransactionId() {
  const token = `${Date.now().toString(36)}${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
  return `HF${token}`.slice(0, 30).toUpperCase();
}
