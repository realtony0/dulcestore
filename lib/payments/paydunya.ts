import { createHash, timingSafeEqual } from "node:crypto";
import { simulatedCheckout, type PaymentRequest, type PaymentResult } from "./index";
import { SITE, SITE_URL } from "../site-config";

/**
 * PayDunya (paydunya.com) — agrégateur sénégalais : Wave, Orange Money,
 * Free Money, Wizall et carte bancaire derrière une seule API.
 *
 * Doc officielle : https://developers.paydunya.com/doc/FR/http_json
 * API « Checkout Invoice » : on crée une facture, PayDunya renvoie l'URL de
 * sa page de paiement, et notifie ensuite le `callback_url` (IPN).
 *
 * Variables attendues (dashboard PayDunya > API d'intégration > votre
 * application) : PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_TOKEN.
 * PAYDUNYA_MODE vaut "test" (défaut, aucun montant réellement débité) ou
 * "live" — le mode live exige que le compte ait passé la validation KYC et
 * que les clés de test soient remplacées par celles de production.
 */

/** Identifiants de canaux documentés : developers.paydunya.com/doc/FR/introduction */
export type PaydunyaChannel = "wave-senegal" | "orange-money-senegal" | "card";

type Credentials = { masterKey: string; privateKey: string; token: string };

type Mode = "test" | "live";

/** Statuts documentés d'une facture. */
export type PaydunyaStatus = "pending" | "completed" | "cancelled" | "failed";

type CreateInvoiceResponse = {
  response_code?: string;
  response_text?: string;
  description?: string;
  token?: string;
};

type ConfirmInvoiceResponse = {
  response_code?: string;
  response_text?: string;
  hash?: string;
  status?: string;
  fail_reason?: string;
  mode?: string;
  invoice?: { token?: string; total_amount?: number | string };
  custom_data?: Record<string, unknown>;
};

/**
 * Les valeurs sont nettoyées : un espace collé par inadvertance dans le
 * panneau d'environnement de Vercel suffirait à faire rejeter les en-têtes
 * d'authentification, avec un message peu parlant.
 */
function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

function credentials(): Credentials | null {
  const masterKey = env("PAYDUNYA_MASTER_KEY");
  const privateKey = env("PAYDUNYA_PRIVATE_KEY");
  const token = env("PAYDUNYA_TOKEN");
  if (!masterKey || !privateKey || !token) return null;
  return { masterKey, privateKey, token };
}

export function isPaydunyaConfigured(): boolean {
  return credentials() !== null;
}

export function paydunyaMode(): Mode {
  return env("PAYDUNYA_MODE") === "live" ? "live" : "test";
}

function apiBaseUrl(): string {
  return paydunyaMode() === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";
}

function authHeaders(c: Credentials): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "PAYDUNYA-MASTER-KEY": c.masterKey,
    "PAYDUNYA-PRIVATE-KEY": c.privateKey,
    "PAYDUNYA-TOKEN": c.token,
  };
}

/**
 * Le `hash` présent dans l'IPN et dans la réponse de confirmation est le
 * SHA-512 de la master key : c'est ce qui atteste que la notification vient
 * bien de PayDunya et non d'un tiers qui connaîtrait l'URL du webhook.
 */
export function isGenuinePaydunyaHash(hash: string | undefined): boolean {
  const c = credentials();
  if (!c || !hash) return false;

  const expected = Buffer.from(createHash("sha512").update(c.masterKey).digest("hex"), "utf8");
  const received = Buffer.from(hash.trim(), "utf8");
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function createPaydunyaPayment(
  req: PaymentRequest,
  channel: PaydunyaChannel,
): Promise<PaymentResult> {
  const c = credentials();
  if (!c) return simulatedCheckout(req.reference);

  // Conservé pour le diagnostic : on sait quel moyen le client avait choisi
  // chez nous, même si la page PayDunya les propose tous.
  void channel;

  const amount = String(req.amountFCFA);

  const response = await fetch(`${apiBaseUrl()}/checkout-invoice/create`, {
    method: "POST",
    headers: authHeaders(c),
    body: JSON.stringify({
      invoice: {
        // `items` et `taxes` sont purement décoratifs côté PayDunya : seul
        // `total_amount` détermine le montant débité.
        items: {
          item_0: {
            name: `Commande ${req.reference}`,
            quantity: 1,
            unit_price: amount,
            total_price: amount,
            description: "Prix des produits — frais de livraison réglés à l'arrivée",
          },
        },
        customer: {
          name: req.customerName,
          phone: req.customerPhone,
          ...(req.customerEmail ? { email: req.customerEmail } : {}),
        },
        // On n'envoie volontairement pas `channels`.
        //
        // Restreindre la page au seul moyen choisi sur notre checkout paraît
        // plus fluide, mais si ce canal n'est pas actif sur le compte marchand,
        // PayDunya affiche une page SANS aucun moyen de paiement : le client ne
        // peut rien faire. C'est ce qui s'est produit au passage en production,
        // les canaux activés en mode test ne l'étant pas en mode live.
        //
        // Sans restriction, PayDunya propose ce que le compte a réellement
        // activé. Le moyen choisi par le client reste enregistré sur la
        // commande, il sert à l'information du vendeur.
        total_amount: req.amountFCFA,
        description: `${SITE.name} — commande ${req.reference}`,
      },
      store: {
        name: SITE.name,
        tagline: SITE.slogan,
        phone: SITE.whatsappNumber,
        website_url: `https://${SITE.domain}`,
      },
      // Jamais affiché au client : c'est notre lien entre la facture PayDunya
      // et la commande, récupéré tel quel lors de la confirmation.
      custom_data: { reference: req.reference },
      actions: {
        cancel_url: `${SITE_URL}/panier`,
        return_url: `${SITE_URL}/commande/confirmation?ref=${req.reference}`,
        callback_url: `${SITE_URL}/api/webhooks/paydunya`,
      },
    }),
  });

  const data = (await response.json()) as CreateInvoiceResponse;

  if (!response.ok || data.response_code !== "00" || !data.response_text) {
    throw new Error(
      `PayDunya a refusé la création de facture pour ${req.reference} : ${JSON.stringify(data)}`,
    );
  }

  return {
    redirectUrl: data.response_text,
    providerRef: data.token ?? null,
    simulated: false,
  };
}

export type PaydunyaConfirmation = {
  status: PaydunyaStatus;
  reference: string | null;
  totalAmountFCFA: number | null;
  failReason: string | null;
};

/**
 * Interroge PayDunya sur le sort réel d'une facture.
 *
 * L'IPN transporte déjà le statut, mais on ne s'en contente pas : rejouer
 * l'appel côté serveur garantit que le montant et le statut enregistrés sont
 * ceux de PayDunya, pas ceux d'une requête fabriquée.
 */
export async function confirmPaydunyaInvoice(
  invoiceToken: string,
): Promise<PaydunyaConfirmation | null> {
  const c = credentials();
  if (!c) return null;

  const response = await fetch(
    `${apiBaseUrl()}/checkout-invoice/confirm/${encodeURIComponent(invoiceToken)}`,
    { method: "GET", headers: authHeaders(c) },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as ConfirmInvoiceResponse;
  if (data.response_code !== "00" || !isGenuinePaydunyaHash(data.hash)) return null;

  const amount = Number(data.invoice?.total_amount);
  const reference = data.custom_data?.reference;

  return {
    status: (data.status ?? "pending") as PaydunyaStatus,
    reference: typeof reference === "string" ? reference : null,
    totalAmountFCFA: Number.isFinite(amount) ? amount : null,
    failReason: data.fail_reason || null,
  };
}
