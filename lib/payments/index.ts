import type { PaymentMethodId } from "../site-config";
import { createWavePayment } from "./wave";
import { createOrangeMoneyPayment } from "./orange-money";
import { createCardPayment } from "./card";
import { createPaypalPayment } from "./paypal";

export type PaymentRequest = {
  reference: string;
  amountFCFA: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
};

export type PaymentResult = {
  /** URL vers laquelle rediriger le client. */
  redirectUrl: string;
  /** Référence côté prestataire, null tant qu'aucun prestataire n'est branché. */
  providerRef: string | null;
  /** true tant que les clés API ne sont pas configurées. */
  simulated: boolean;
};

const HANDLERS: Record<PaymentMethodId, (req: PaymentRequest) => Promise<PaymentResult>> = {
  WAVE: createWavePayment,
  ORANGE_MONEY: createOrangeMoneyPayment,
  CARTE: createCardPayment,
  PAYPAL: createPaypalPayment,
};

export function createPayment(method: PaymentMethodId, req: PaymentRequest) {
  return HANDLERS[method](req);
}

/** Redirection utilisée tant qu'aucune clé API n'est renseignée. */
export function simulatedCheckout(reference: string): PaymentResult {
  return {
    redirectUrl: `/commande/confirmation?ref=${reference}&simule=1`,
    providerRef: null,
    simulated: true,
  };
}
