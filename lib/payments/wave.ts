import { createGatewayPayment } from "./gateway";
import type { PaymentRequest, PaymentResult } from "./index";

/** Wave via l'agrégateur configuré — voir lib/payments/gateway.ts. */
export async function createWavePayment(req: PaymentRequest): Promise<PaymentResult> {
  return createGatewayPayment(req, "WAVE");
}
