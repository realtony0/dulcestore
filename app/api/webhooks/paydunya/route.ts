import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { confirmPaydunyaInvoice, isGenuinePaydunyaHash } from "@/lib/payments/paydunya";

/**
 * IPN PayDunya — notification serveur-à-serveur envoyée au `callback_url`
 * quand le statut d'une facture change.
 * Doc : https://developers.paydunya.com/doc/FR/http_json
 *
 * PayDunya poste du `x-www-form-urlencoded` dont les clés sont imbriquées
 * (`data[invoice][token]`, `data[status]`…), et non du JSON.
 *
 * On ne fait JAMAIS confiance au navigateur du client pour confirmer un
 * paiement (return_url) : seule cette route fait passer une commande à
 * « payée », et uniquement après avoir re-interrogé PayDunya.
 */

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/** Reconstruit `{ data: { invoice: { token } } }` à partir de `data[invoice][token]`. */
function parseBracketForm(form: FormData): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  for (const [rawKey, rawValue] of form.entries()) {
    if (typeof rawValue !== "string") continue;

    const path = rawKey.replace(/\]/g, "").split("[").filter(Boolean);
    if (path.length === 0 || path.some((k) => DANGEROUS_KEYS.has(k))) continue;

    let node = root;
    for (const key of path.slice(0, -1)) {
      if (typeof node[key] !== "object" || node[key] === null) node[key] = {};
      node = node[key] as Record<string, unknown>;
    }
    node[path[path.length - 1]] = rawValue;
  }

  return root;
}

async function parsePayload(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as Record<string, unknown>;
  }
  return parseBracketForm(await request.formData());
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await parsePayload(request);
  } catch {
    return new NextResponse("Requête invalide", { status: 400 });
  }

  // Les champs sont regroupés sous `data`, sauf si PayDunya les poste à plat.
  const data = "data" in payload ? asRecord(payload.data) : payload;

  if (!isGenuinePaydunyaHash(typeof data.hash === "string" ? data.hash : undefined)) {
    return new NextResponse("Signature invalide", { status: 401 });
  }

  const invoiceToken = asRecord(data.invoice).token;
  if (typeof invoiceToken !== "string" || !invoiceToken) {
    return new NextResponse("Token de facture manquant", { status: 400 });
  }

  // Le statut annoncé dans l'IPN n'est pas repris tel quel : on redemande à
  // PayDunya, qui fait seul autorité sur le statut et le montant.
  const confirmation = await confirmPaydunyaInvoice(invoiceToken);
  if (!confirmation) {
    console.error(`[paydunya] confirmation impossible pour la facture ${invoiceToken}`);
    // 500 : PayDunya réessaiera plutôt que de considérer la commande traitée.
    return new NextResponse("Confirmation impossible", { status: 500 });
  }

  const reference = confirmation.reference;
  if (!reference) {
    console.error(`[paydunya] facture ${invoiceToken} sans référence de commande`);
    return new NextResponse("OK", { status: 200 });
  }

  const order = await prisma.order.findUnique({ where: { reference } });
  if (!order) {
    // On répond 200 : PayDunya ne doit pas boucler sur une référence inconnue
    // (test manuel, commande supprimée…).
    return new NextResponse("OK", { status: 200 });
  }

  switch (confirmation.status) {
    case "completed": {
      // Un paiement n'est accepté que s'il correspond au montant attendu :
      // garde-fou contre une facture rejouée avec un total différent.
      if (confirmation.totalAmountFCFA !== order.productTotalFCFA) {
        console.error(
          `[paydunya] montant inattendu pour ${reference} : ${confirmation.totalAmountFCFA} reçu, ${order.productTotalFCFA} attendu`,
        );
        return new NextResponse("Montant incohérent", { status: 409 });
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAYE",
          status: "PAIEMENT_CONFIRME",
          providerRef: invoiceToken,
        },
      });
      break;
    }

    case "cancelled":
    case "failed":
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "ECHEC", providerRef: invoiceToken },
      });
      break;

    case "pending":
      // Paiement encore en cours de traitement : rien à enregistrer.
      break;
  }

  return new NextResponse("OK", { status: 200 });
}
