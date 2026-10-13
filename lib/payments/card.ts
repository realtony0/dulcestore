import { createGatewayPayment } from "./gateway";
import type { PaymentRequest, PaymentResult } from "./index";

/** Carte bancaire via l'agrégateur configuré — voir lib/payments/gateway.ts. */
export async function createCardPayment(req: PaymentRequest): Promise<PaymentResult> {
  return createGatewayPayment(req, "CARTE");
}
