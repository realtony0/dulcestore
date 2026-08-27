import { simulatedCheckout, type PaymentRequest, type PaymentResult } from "./index";
import { SITE_URL } from "../site-config";

/**
 * PayTech (paytech.sn) — agrégateur sénégalais : Wave, Orange Money, carte bancaire
 * et autres mobile money derrière une seule API. Doc officielle :
 * https://doc.intech.sn/doc_paytech.php
 *
 * PAYTECH_API_KEY et PAYTECH_API_SECRET viennent du dashboard PayTech
 * (Réglages > API). PAYTECH_ENV vaut "test" (défaut, montant débité factice
 * 100-150 FCFA) ou "prod" (nécessite un compte PayTech activé).
 */

const PAYTECH_BASE_URL = "https://paytech.sn/api";

export type PaytechTargetPayment = "Wave" | "Orange Money" | "Carte Bancaire";

type PaytechRequestPaymentResponse = {
  success: 0 | 1;
  token?: string;
  redirect_url?: string;
  redirectUrl?: string;
  errors?: unknown;
};

function siteUrl(): string {
  return SITE_URL;
}

/**
 * Pré-remplit la page de paiement PayTech avec les informations déjà saisies
 * sur notre checkout, pour éviter au client de retaper nom et téléphone.
 * Paramètres documentés : `fn` (nom complet), `pn` (téléphone avec indicatif),
 * `tp` (moyen de paiement), `nac` (soumission automatique).
 * On laisse `nac=0` : le client garde la main sur la validation finale.
 * Ne fonctionne que si un seul `target_payment` est demandé, ce qui est le cas.
 */
function withPrefill(
  redirectUrl: string,
  req: PaymentRequest,
  targetPayment: PaytechTargetPayment,
): string {
  // On ne pré-remplit QUE le nom. Testé le 27 août 2026 : passer le numéro
  // (`nn`, format national) fait déclencher la demande de paiement à PayTech
  // immédiatement, sans écran de validation, même avec `nac=0`. Le client doit
  // garder la main — et saisir lui-même son numéro vérifie au passage qu'il
  // paie depuis le bon compte mobile money.
  try {
    const url = new URL(redirectUrl);
    if (req.customerName) url.searchParams.set("fn", req.customerName);
    url.searchParams.set("tp", targetPayment);
    url.searchParams.set("nac", "0");
    return url.toString();
  } catch {
    // URL inattendue renvoyée par PayTech : on redirige tel quel plutôt que
    // de casser le paiement pour un simple confort de saisie.
    return redirectUrl;
  }
}

export async function createPaytechPayment(
  req: PaymentRequest,
  targetPayment: PaytechTargetPayment,
): Promise<PaymentResult> {
  const apiKey = process.env.PAYTECH_API_KEY;
  const apiSecret = process.env.PAYTECH_API_SECRET;
  if (!apiKey || !apiSecret) return simulatedCheckout(req.reference);

  const env = process.env.PAYTECH_ENV === "prod" ? "prod" : "test";
  const site = siteUrl();
  // PayTech exige un ipn_url en HTTPS (pas de valeur par défaut côté compte) :
  // impossible d'obtenir une redirection de paiement en local sans tunnel
  // HTTPS (ngrok) pointé par NEXT_PUBLIC_SITE_URL — voir le README.

  const response = await fetch(`${PAYTECH_BASE_URL}/payment/request-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      API_KEY: apiKey,
      API_SECRET: apiSecret,
    },
    body: JSON.stringify({
      item_name: `Commande ${req.reference}`,
      item_price: req.amountFCFA,
      currency: "XOF",
      ref_command: req.reference,
      command_name: `Dulce Store — ${req.reference}`,
      env,
      target_payment: targetPayment,
      ipn_url: `${site}/api/webhooks/paytech`,
      success_url: `${site}/commande/confirmation?ref=${req.reference}`,
      cancel_url: `${site}/panier`,
      custom_field: JSON.stringify({ reference: req.reference }),
    }),
  });

  const data = (await response.json()) as PaytechRequestPaymentResponse;

  if (!response.ok || data.success !== 1 || !(data.redirect_url ?? data.redirectUrl)) {
    throw new Error(
      `PayTech a refusé la demande de paiement pour ${req.reference} : ${JSON.stringify(data.errors ?? data)}`,
    );
  }

  return {
    redirectUrl: withPrefill(data.redirect_url ?? data.redirectUrl!, req, targetPayment),
    providerRef: data.token ?? null,
    simulated: false,
  };
}
