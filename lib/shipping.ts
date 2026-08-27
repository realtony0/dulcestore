export type Destination = "SENEGAL" | "EUROPE_USA";

export type ShippingMethodId = "FRET_EXPRESS" | "FRET" | "CARGO_MARITIME" | "FRET_INTERNATIONAL";

export type ShippingMethod = {
  id: ShippingMethodId;
  name: string;
  destination: Destination;
  /** Tarif affiché au client. null = communiqué après validation de la commande. */
  rate: { amountFCFA: number; unit: "kg" | "CBM" } | null;
  delay: string | null;
  note: string;
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "FRET_EXPRESS",
    name: "Fret express",
    destination: "SENEGAL",
    rate: { amountFCFA: 11000, unit: "kg" },
    delay: "3 à 5 jours",
    note: "Le plus rapide. Idéal pour les petits colis et les commandes urgentes.",
  },
  {
    id: "FRET",
    name: "Fret",
    destination: "SENEGAL",
    rate: { amountFCFA: 7500, unit: "kg" },
    delay: "5 à 10 jours",
    note: "Le meilleur rapport qualité-prix pour la plupart des commandes.",
  },
  {
    id: "CARGO_MARITIME",
    name: "Cargo maritime",
    destination: "SENEGAL",
    rate: { amountFCFA: 170000, unit: "CBM" },
    delay: "25 à 35 jours",
    note: "Pour les gros volumes : matériel de cuisine pro, machines, packaging en quantité.",
  },
  {
    id: "FRET_INTERNATIONAL",
    name: "Fret international",
    destination: "EUROPE_USA",
    rate: null,
    delay: null,
    note: "Europe et États-Unis : fret uniquement. Le tarif dépend du poids et du volume réels de votre colis, il vous est communiqué par WhatsApp après validation de la commande.",
  },
];

export const EUROPE_USA_STEPS = [
  "Vous validez votre commande et payez le prix des produits.",
  "Dulce Store calcule le coût du fret selon votre colis.",
  "Nous vous contactons via WhatsApp.",
  "Le montant de la livraison vous est communiqué.",
  "La livraison est réglée selon les modalités prévues.",
];

export function getShippingMethod(id: string): ShippingMethod | undefined {
  return SHIPPING_METHODS.find((m) => m.id === id);
}

export function methodsForDestination(destination: Destination): ShippingMethod[] {
  return SHIPPING_METHODS.filter((m) => m.destination === destination);
}

/** Estimation indicative au poids. Le montant définitif est fixé à l'arrivée du colis. */
export function estimateShippingFCFA(method: ShippingMethod, totalWeightKg: number): number | null {
  if (!method.rate || method.rate.unit !== "kg") return null;
  return Math.round(method.rate.amountFCFA * totalWeightKg);
}

export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString("fr-FR").replace(/ | /g, " ")} FCFA`;
}
