import { createGatewayPayment } from "./gateway";
import type { PaymentRequest, PaymentResult } from "./index";

/** Orange Money via l'agrégateur configuré — voir lib/payments/gateway.ts. */
export async function createOrangeMoneyPayment(req: PaymentRequest): Promise<PaymentResult> {
  return createGatewayPayment(req, "ORANGE_MONEY");
}
