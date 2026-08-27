/**
 * Contenu éditable du site. Pour changer les infos de la boutique,
 * modifier uniquement ce fichier (et lib/shipping.ts pour les tarifs).
 */

export const SITE = {
  name: "Dulce Store",
  slogan: "Tout pour tous, au même endroit.",
  intro: "Votre plateforme de vente depuis la Chine.",
  pitch:
    "Dulce Store sert aussi bien le particulier qui achète un sac ou un cadeau que le professionnel qui cherche du matériel de cuisine ou du packaging.",
  /** Format international sans le « + ». */
  whatsappNumber: "221778760166",
  domain: "dulce-store.com",
  email: "contact@dulce-store.com",
};

/** URL publique du site. NEXT_PUBLIC_SITE_URL prime (tunnel HTTPS en dev). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? `https://${SITE.domain}`;

export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}


export type PaymentMethodId = "WAVE" | "ORANGE_MONEY" | "CARTE" | "PAYPAL";

/** `icon` référence une clé de components/icons.tsx (PAYMENT_ICONS). */
export const PAYMENT_METHODS: { id: PaymentMethodId; name: string; icon: PaymentMethodId; hint: string }[] = [
  { id: "WAVE", name: "Wave", icon: "WAVE", hint: "Paiement mobile instantané" },
  { id: "ORANGE_MONEY", name: "Orange Money", icon: "ORANGE_MONEY", hint: "Paiement mobile instantané" },
  { id: "CARTE", name: "Carte bancaire", icon: "CARTE", hint: "Visa, Mastercard" },
  { id: "PAYPAL", name: "PayPal", icon: "PAYPAL", hint: "Pour les paiements depuis l'étranger" },
];
