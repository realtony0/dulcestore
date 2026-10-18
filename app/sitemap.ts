import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { getAllProductSlugs, getCategories } from "@/lib/queries";

/**
 * Plan du site, annoncé par app/robots.ts.
 *
 * Sans ce fichier, /sitemap.xml renvoyait une 404 alors que robots.txt le
 * déclarait : les moteurs devaient découvrir les 81 fiches produits à la
 * trace, au lieu de recevoir la liste.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/boutique", "/a-propos", "/contact", "/infos", "/cgv", "/mentions-legales", "/confidentialite"];
  const statiques = pages.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  // Une base momentanément injoignable ne doit pas faire échouer le
  // déploiement : on publie alors le plan du site réduit aux pages fixes,
  // que la prochaine régénération complétera.
  let products: { slug: string }[] = [];
  let categories: { slug: string }[] = [];
  try {
    [products, categories] = await Promise.all([getAllProductSlugs(), getCategories()]);
  } catch (error) {
    console.error("[sitemap] catalogue indisponible, plan du site réduit :", error);
    return statiques;
  }

  return [
    ...statiques,
    ...categories.map((c) => ({
      url: `${SITE_URL}/boutique?categorie=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/produit/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
