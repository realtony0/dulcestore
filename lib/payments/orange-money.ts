import { createPaytechPayment } from "./paytech";
import type { PaymentRequest, PaymentResult } from "./index";

/** Orange Money via PayTech — voir lib/payments/paytech.ts. */
export async function createOrangeMoneyPayment(req: PaymentRequest): Promise<PaymentResult> {
  return createPaytechPayment(req, "Orange Money");
}
