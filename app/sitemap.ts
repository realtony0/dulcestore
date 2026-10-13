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
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getAllProductSlugs(), getCategories()]);

  const pages = ["", "/boutique", "/a-propos", "/contact", "/infos", "/cgv", "/mentions-legales", "/confidentialite"];

  return [
    ...pages.map((path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.6,
    })),
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
