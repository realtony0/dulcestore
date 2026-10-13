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


/**
 * Identité légale de l'entreprise, affichée dans les mentions légales et les CGV.
 *
 * La loi sénégalaise n° 2008-08 sur les transactions électroniques (article 10)
 * impose d'afficher la raison sociale, l'adresse complète de l'établissement,
 * l'adresse e-mail et le téléphone ; pour une société immatriculée s'y ajoutent
 * le numéro RCCM, le capital social et l'adresse du siège, ainsi que le NINEA
 * pour les assujettis à la TVA.
 *
 * ⚠️ CES CHAMPS DOIVENT ÊTRE REMPLIS AVANT D'ENCAISSER DE VRAIS PAIEMENTS.
 * Tant qu'ils sont vides, les pages légales affichent un avertissement visible
 * au lieu d'une information fausse.
 */
export const LEGAL = {
  /** Raison sociale ou nom et prénom si entreprise individuelle. */
  raisonSociale: "",
  /** Ex. « SARL », « SUARL », « Entreprise individuelle ». */
  formeJuridique: "",
  /** Montant en FCFA, vide si entreprise individuelle. */
  capitalSocial: "",
  /** Registre du Commerce et du Crédit Mobilier. */
  rccm: "",
  /** Numéro d'Identification National des Entreprises et Associations. */
  ninea: "",
  /** Adresse complète du siège (rue, quartier, ville, pays). */
  siege: "",
  /** Responsable de la publication du site. */
  directeurPublication: "",
  /** Date de dernière mise à jour des pages légales. */
  miseAJour: "13 octobre 2026",
};

/** true quand toutes les mentions obligatoires sont renseignées. */
export function isLegalComplete(): boolean {
  return [
    LEGAL.raisonSociale,
    LEGAL.rccm,
    LEGAL.ninea,
    LEGAL.siege,
    LEGAL.directeurPublication,
  ].every((v) => v.trim().length > 0);
}

/** Hébergeur du site, à mentionner dans les mentions légales. */
export const HOSTING = {
  nom: "Vercel Inc.",
  site: "https://vercel.com",
  pays: "États-Unis",
};

export type PaymentMethodId = "WAVE" | "ORANGE_MONEY" | "CARTE" | "PAYPAL";

/** `icon` référence une clé de components/icons.tsx (PAYMENT_ICONS). */
export const PAYMENT_METHODS: { id: PaymentMethodId; name: string; icon: PaymentMethodId; hint: string }[] = [
  { id: "WAVE", name: "Wave", icon: "WAVE", hint: "Paiement mobile instantané" },
  { id: "ORANGE_MONEY", name: "Orange Money", icon: "ORANGE_MONEY", hint: "Paiement mobile instantané" },
  { id: "CARTE", name: "Carte bancaire", icon: "CARTE", hint: "Visa, Mastercard" },
  { id: "PAYPAL", name: "PayPal", icon: "PAYPAL", hint: "Pour les paiements depuis l'étranger" },
];
