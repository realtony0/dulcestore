import { createPaytechPayment } from "./paytech";
import type { PaymentRequest, PaymentResult } from "./index";

/** Wave via PayTech — voir lib/payments/paytech.ts. */
export async function createWavePayment(req: PaymentRequest): Promise<PaymentResult> {
  return createPaytechPayment(req, "Wave");
}
