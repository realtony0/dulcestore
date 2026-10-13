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

/**
 * URL publique du site. NEXT_PUBLIC_SITE_URL prime (tunnel HTTPS en dev).
 *
 * Le repli vise le sous-domaine www : c'est l'adresse canonique servie par
 * l'hébergeur, dulce-store.com y renvoyant par une redirection 308. Or cette
 * valeur construit l'URL d'IPN communiquée au prestataire de paiement, et rien
 * ne garantit qu'il suive une redirection — une confirmation de paiement
 * perdue laisserait la commande bloquée « en attente » alors que le client a
 * bien payé.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? `https://www.${SITE.domain}`;

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

export type PaymentMethodId = "WAVE" | "ORANGE_MONEY" | "CARTE";

/**
 * Moyens de paiement annoncés au client (pied de page, page Infos, CGV).
 *
 * Ce n'est plus un choix fait sur notre site : le client sélectionne son moyen
 * sur la page sécurisée du prestataire, qui n'affiche que ce qui est
 * réellement disponible. Cette liste sert uniquement à l'affichage.
 *
 * `icon` référence une clé de components/icons.tsx (PAYMENT_LOGOS).
 */
export const PAYMENT_METHODS: { id: PaymentMethodId; name: string; icon: PaymentMethodId; hint: string }[] = [
  { id: "WAVE", name: "Wave", icon: "WAVE", hint: "Paiement mobile instantané" },
  { id: "ORANGE_MONEY", name: "Orange Money", icon: "ORANGE_MONEY", hint: "Paiement mobile instantané" },
  { id: "CARTE", name: "Carte bancaire", icon: "CARTE", hint: "Visa, Mastercard" },
];

/**
 * Libellé lisible du moyen de paiement enregistré sur une commande.
 *
 * Avant paiement on ne connaît que l'agrégateur ; après paiement, le
 * prestataire nous renvoie le moyen réellement utilisé, sous ses propres
 * identifiants (« wave-senegal », « card »…).
 */
export function paymentMethodLabel(value: string): string {
  const connus: Record<string, string> = {
    PAYDUNYA: "Paiement en ligne",
    PAYTECH: "Paiement en ligne",
    SIMULE: "Paiement simulé",
    WAVE: "Wave",
    ORANGE_MONEY: "Orange Money",
    CARTE: "Carte bancaire",
    "wave-senegal": "Wave",
    "orange-money-senegal": "Orange Money",
    "free-money-senegal": "Free Money",
    "wizall-senegal": "Wizall",
    "expresso-sn": "Expresso",
    card: "Carte bancaire",
  };
  const cle = value.trim();
  return connus[cle] ?? connus[cle.toLowerCase()] ?? cle;
}
