import { SITE, SITE_URL } from "./site-config";
import { isDisplayableImage } from "./images";

/**
 * Données structurées et métadonnées de partage.
 *
 * Deux enjeux distincts :
 *
 * 1. Le partage sur WhatsApp, premier canal de diffusion au Sénégal. L'aperçu
 *    affiché dépend des balises Open Graph : sans image propre à la fiche, le
 *    destinataire voit le logo de la boutique au lieu du produit.
 *
 * 2. La compréhension par les moteurs. Le JSON-LD leur donne explicitement le
 *    prix, la devise et la disponibilité, ce qu'aucune analyse du texte ne
 *    permet de deviner de façon fiable.
 */

/** Une URL absolue est exigée par Open Graph ; les chemins relatifs sont ignorés. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Image de partage d'un produit, avec repli sur le logo si la photo est inexploitable. */
export function shareImage(imageUrl: string | null | undefined): string {
  return isDisplayableImage(imageUrl) ? absoluteUrl(imageUrl) : absoluteUrl("/logo.jpeg");
}

/**
 * Description de partage : l'accroche si elle existe, sinon le début de la
 * description, sinon une phrase construite à partir du nom et de la catégorie.
 * 58 fiches sur 81 n'ont pas d'accroche — sans ce repli, leur aperçu serait vide.
 */
export function shareDescription(p: {
  name: string;
  tagline: string;
  description: string;
  categoryName: string;
}): string {
  const accroche = p.tagline.trim();
  if (accroche) return accroche;

  const texte = p.description.trim().replace(/\s+/g, " ");
  if (texte) return texte.length > 157 ? `${texte.slice(0, 157)}…` : texte;

  return `${p.name} — ${p.categoryName} importé de Chine et livré au Sénégal par ${SITE.name}.`;
}

type ProduitJsonLd = {
  slug: string;
  name: string;
  description: string;
  imageUrls: string[];
  priceFCFA: number;
  inStock: boolean;
  categoryName: string;
  variantCount: number;
};

/** Fiche produit au format schema.org, lue par Google pour les résultats enrichis. */
export function productJsonLd(p: ProduitJsonLd) {
  const url = absoluteUrl(`/produit/${p.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.imageUrls.filter(isDisplayableImage).map(absoluteUrl),
    category: p.categoryName,
    url,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      // Plusieurs tailles au même catalogue : on annonce une fourchette dont le
      // prix le plus bas, celui affiché « à partir de » sur la fiche.
      "@type": p.variantCount > 1 ? "AggregateOffer" : "Offer",
      url,
      priceCurrency: "XOF",
      ...(p.variantCount > 1
        ? { lowPrice: p.priceFCFA, offerCount: p.variantCount }
        : { price: p.priceFCFA }),
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE.name },
    },
  };
}

/** Fil d'Ariane structuré : Google l'affiche à la place de l'URL brute. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Identité de la boutique, et champ de recherche dans les résultats Google. */
export function organizationJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      name: SITE.name,
      url: SITE_URL,
      logo: absoluteUrl("/logo.jpeg"),
      email: SITE.email,
      telephone: `+${SITE.whatsappNumber}`,
      areaServed: ["SN", "FR", "US"],
      currenciesAccepted: "XOF",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: SITE_URL,
      inLanguage: "fr",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/recherche?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

/** Insère un bloc JSON-LD. Le contenu vient de notre base, jamais du visiteur. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
