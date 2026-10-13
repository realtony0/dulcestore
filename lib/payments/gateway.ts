import { simulatedCheckout, type PaymentRequest, type PaymentResult } from "./index";
import { createPaydunyaPayment, isPaydunyaConfigured, type PaydunyaChannel } from "./paydunya";
import { createPaytechPayment, isPaytechConfigured, type PaytechTargetPayment } from "./paytech";

/**
 * Choix de l'agrégateur qui encaisse Wave, Orange Money et carte bancaire.
 *
 * Deux prestataires sont branchés : PayDunya et PayTech. Par défaut on prend
 * PayDunya dès que ses clés sont renseignées, PayTech sinon. PAYMENT_PROVIDER
 * ("paydunya" ou "paytech") force l'un des deux — utile pour revenir en
 * arrière sans redéployer de code si l'un des comptes pose problème.
 *
 * Tant qu'aucun des deux n'est configuré, la commande est enregistrée et le
 * client est redirigé vers une confirmation « paiement simulé ».
 */

type GatewayMethod = "WAVE" | "ORANGE_MONEY" | "CARTE";

/** Identifiants propres à chaque prestataire pour un même moyen de paiement. */
const CHANNELS: Record<
  GatewayMethod,
  { paydunya: PaydunyaChannel; paytech: PaytechTargetPayment }
> = {
  WAVE: { paydunya: "wave-senegal", paytech: "Wave" },
  ORANGE_MONEY: { paydunya: "orange-money-senegal", paytech: "Orange Money" },
  CARTE: { paydunya: "card", paytech: "Carte Bancaire" },
};

function forcedProvider(): "paydunya" | "paytech" | null {
  const value = (process.env.PAYMENT_PROVIDER ?? "").trim().toLowerCase();
  return value === "paydunya" || value === "paytech" ? value : null;
}

export function createGatewayPayment(
  req: PaymentRequest,
  method: GatewayMethod,
): Promise<PaymentResult> {
  const channel = CHANNELS[method];
  const forced = forcedProvider();

  if (forced === "paytech" && isPaytechConfigured()) {
    return createPaytechPayment(req, channel.paytech);
  }
  if (forced !== "paytech" && isPaydunyaConfigured()) {
    return createPaydunyaPayment(req, channel.paydunya);
  }
  if (isPaytechConfigured()) {
    return createPaytechPayment(req, channel.paytech);
  }
  return Promise.resolve(simulatedCheckout(req.reference));
}
