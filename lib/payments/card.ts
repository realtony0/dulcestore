import { createPaytechPayment } from "./paytech";
import type { PaymentRequest, PaymentResult } from "./index";

/** Carte bancaire via PayTech — voir lib/payments/paytech.ts. */
export async function createCardPayment(req: PaymentRequest): Promise<PaymentResult> {
  return createPaytechPayment(req, "Carte Bancaire");
}
