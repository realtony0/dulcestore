import { simulatedCheckout, type PaymentRequest, type PaymentResult } from "./index";

/**
 * PayPal Orders API v2.
 * Nécessite PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET. Le montant doit être converti
 * du FCFA vers une devise supportée par PayPal (EUR ou USD) avant l'appel.
 */
export async function createPaypalPayment(req: PaymentRequest): Promise<PaymentResult> {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return simulatedCheckout(req.reference);
  }

  throw new Error("Intégration PayPal à implémenter : créer l'ordre puis rediriger vers approve.");
}
