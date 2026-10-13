import { simulatedCheckout, type PaymentRequest, type PaymentResult } from "./index";
import { createPaydunyaPayment, isPaydunyaConfigured } from "./paydunya";
import { createPaytechPayment, isPaytechConfigured } from "./paytech";

/**
 * Choix de l'agrégateur qui encaisse la commande.
 *
 * Deux prestataires sont branchés : PayDunya et PayTech. Par défaut on prend
 * PayDunya dès que ses clés sont renseignées, PayTech sinon. PAYMENT_PROVIDER
 * ("paydunya" ou "paytech") force l'un des deux — utile pour revenir en
 * arrière sans redéployer de code si l'un des comptes pose problème.
 *
 * Aucun moyen de paiement n'est imposé : le client choisit sur la page du
 * prestataire, qui n'affiche que ce que le compte a réellement activé.
 *
 * Tant qu'aucun des deux n'est configuré, la commande est enregistrée et le
 * client est redirigé vers une confirmation « paiement simulé ».
 */

function forcedProvider(): "paydunya" | "paytech" | null {
  const value = (process.env.PAYMENT_PROVIDER ?? "").trim().toLowerCase();
  return value === "paydunya" || value === "paytech" ? value : null;
}

/** Identifie l'agrégateur retenu, enregistré sur la commande. */
export function gatewayName(): string {
  const forced = forcedProvider();
  if (forced === "paytech" && isPaytechConfigured()) return "PAYTECH";
  if (forced !== "paytech" && isPaydunyaConfigured()) return "PAYDUNYA";
  if (isPaytechConfigured()) return "PAYTECH";
  return "SIMULE";
}

export function createGatewayPayment(req: PaymentRequest): Promise<PaymentResult> {
  switch (gatewayName()) {
    case "PAYDUNYA":
      return createPaydunyaPayment(req);
    case "PAYTECH":
      return createPaytechPayment(req);
    default:
      return Promise.resolve(simulatedCheckout(req.reference));
  }
}
