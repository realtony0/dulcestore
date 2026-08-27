import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * IPN PayTech — notification serveur-à-serveur appelée par PayTech quand le
 * statut d'un paiement change (doc : https://doc.intech.sn/doc_paytech.php).
 *
 * L'URL doit être publique et en HTTPS pour que PayTech puisse l'appeler :
 * en local, utiliser un tunnel (ex. `ngrok http 3000`) et renseigner
 * NEXT_PUBLIC_SITE_URL avec l'URL ngrok le temps du test.
 *
 * On ne fait JAMAIS confiance au navigateur du client pour confirmer un
 * paiement (success_url) : seule cette route, vérifiée par signature,
 * fait passer une commande à "payée".
 */

type PaytechIpnPayload = {
  type_event?: string;
  ref_command?: string;
  item_price?: string | number;
  token?: string;
  api_key_sha256?: string;
  api_secret_sha256?: string;
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isGenuinePaytechRequest(payload: PaytechIpnPayload): boolean {
  const apiKey = process.env.PAYTECH_API_KEY;
  const apiSecret = process.env.PAYTECH_API_SECRET;
  if (!apiKey || !apiSecret) return false;
  if (!payload.api_key_sha256 || !payload.api_secret_sha256) return false;

  return (
    payload.api_key_sha256 === sha256(apiKey) && payload.api_secret_sha256 === sha256(apiSecret)
  );
}

async function parsePayload(request: Request): Promise<PaytechIpnPayload> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as PaytechIpnPayload;
  }
  // PayTech envoie généralement du x-www-form-urlencoded.
  const form = await request.formData();
  return Object.fromEntries(form.entries()) as PaytechIpnPayload;
}

export async function POST(request: Request) {
  let payload: PaytechIpnPayload;
  try {
    payload = await parsePayload(request);
  } catch {
    return new NextResponse("Requête invalide", { status: 400 });
  }

  if (!isGenuinePaytechRequest(payload)) {
    return new NextResponse("Signature invalide", { status: 401 });
  }

  const reference = payload.ref_command;
  if (!reference) return new NextResponse("ref_command manquant", { status: 400 });

  const order = await prisma.order.findUnique({ where: { reference } });
  if (!order) {
    // On répond 200 : PayTech ne doit pas boucler indéfiniment sur un ref
    // inconnu (test manuel, commande supprimée, etc.).
    return new NextResponse("OK", { status: 200 });
  }

  switch (payload.type_event) {
    case "sale_complete":
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAYE",
          status: "PAIEMENT_CONFIRME",
          providerRef: payload.token ?? order.providerRef,
        },
      });
      break;
    case "sale_canceled":
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "ECHEC" },
      });
      break;
    case "refund_complete":
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "REMBOURSE" },
      });
      break;
    default:
      // Autres événements (transferts…) non pertinents pour une commande Dulce Store.
      break;
  }

  return new NextResponse("OK", { status: 200 });
}
