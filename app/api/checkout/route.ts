import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getShippingMethod, type Destination } from "@/lib/shipping";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/lib/site-config";
import { createPayment } from "@/lib/payments";

type IncomingItem = { productSlug: string; variantId: string | null; quantity: number };

type CheckoutBody = {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string | null;
  destination?: string;
  customerCity?: string;
  customerAddress?: string | null;
  shippingMethod?: string;
  paymentMethod?: string;
  items?: IncomingItem[];
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/** Référence lisible communiquée au client (WhatsApp, suivi de commande). */
function generateReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `DS-${suffix}`;
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return badRequest("Requête invalide.");
  }

  const customerName = body.customerName?.trim() ?? "";
  const customerPhone = body.customerPhone?.trim() ?? "";
  const customerCity = body.customerCity?.trim() ?? "";
  const customerEmail = body.customerEmail?.trim() || null;
  const customerAddress = body.customerAddress?.trim() || null;

  if (customerName.length < 2) return badRequest("Veuillez indiquer votre nom complet.");
  if (customerPhone.length < 6) return badRequest("Veuillez indiquer un numéro de téléphone valide.");
  if (!customerCity) return badRequest("Veuillez indiquer votre ville.");

  const destination = body.destination as Destination;
  if (destination !== "SENEGAL" && destination !== "EUROPE_USA") {
    return badRequest("Destination invalide.");
  }

  const shippingMethod = getShippingMethod(body.shippingMethod ?? "");
  if (!shippingMethod) return badRequest("Mode de livraison invalide.");
  if (shippingMethod.destination !== destination) {
    return badRequest("Ce mode de livraison n'est pas disponible pour cette destination.");
  }

  const paymentMethod = body.paymentMethod as PaymentMethodId;
  if (!PAYMENT_METHODS.some((m) => m.id === paymentMethod)) {
    return badRequest("Moyen de paiement invalide.");
  }

  const items = body.items ?? [];
  if (items.length === 0) return badRequest("Votre panier est vide.");

  // Les prix sont toujours relus en base : jamais ceux envoyés par le navigateur.
  const products = await prisma.product.findMany({
    where: { slug: { in: items.map((i) => i.productSlug) } },
    include: { variants: true },
  });

  let productTotalFCFA = 0;
  let totalWeightKg = 0;
  const orderItems = [];

  for (const item of items) {
    const product = products.find((p) => p.slug === item.productSlug);
    if (!product) return badRequest(`Produit introuvable : ${item.productSlug}`);
    if (!product.inStock) return badRequest(`${product.name} n'est plus disponible.`);

    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null;
    if (item.variantId && !variant) return badRequest(`Option indisponible pour ${product.name}.`);

    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isFinite(quantity) || quantity < product.minOrderQty) {
      return badRequest(
        `${product.name} : la quantité minimum de commande est de ${product.minOrderQty}.`,
      );
    }

    const unitPriceFCFA = variant?.priceFCFA ?? product.priceFCFA;
    const unitWeightKg = variant?.weightKg ?? product.weightKg;

    productTotalFCFA += unitPriceFCFA * quantity;
    totalWeightKg += unitWeightKg * quantity;

    orderItems.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      label: variant ? `${product.name} — ${variant.name}` : product.name,
      quantity,
      unitPriceFCFA,
    });
  }

  const reference = generateReference();

  const order = await prisma.order.create({
    data: {
      reference,
      customerName,
      customerPhone,
      customerEmail,
      destination,
      customerCity,
      customerAddress,
      shippingMethod: shippingMethod.id,
      productTotalFCFA,
      totalWeightKg,
      paymentMethod,
      items: { create: orderItems },
    },
  });

  // La commande est déjà enregistrée : si le prestataire de paiement refuse
  // (compte non activé, panne, clés invalides), on ne la perd pas. On renvoie
  // le client vers sa confirmation avec un message clair plutôt qu'une 500
  // muette, et il est recontacté sur WhatsApp pour régler autrement.
  let payment;
  try {
    payment = await createPayment(paymentMethod, {
      reference,
      amountFCFA: productTotalFCFA,
      customerName,
      customerPhone,
      customerEmail,
    });
  } catch (error) {
    console.error(`Paiement indisponible pour la commande ${reference} :`, error);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAIEMENT_INDISPONIBLE" },
    });
    return NextResponse.json({
      reference,
      redirectUrl: `/commande/confirmation?ref=${reference}&paiement=indisponible`,
    });
  }

  if (payment.providerRef) {
    await prisma.order.update({
      where: { id: order.id },
      data: { providerRef: payment.providerRef },
    });
  }

  return NextResponse.json({ reference, redirectUrl: payment.redirectUrl });
}
