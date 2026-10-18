import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    // Le panier et le tunnel de commande sont propres à chaque visiteur et
    // sans contenu à indexer. Ce sont des composants client : ils ne peuvent
    // pas porter de balise « noindex », d'où leur exclusion ici.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/panier", "/commande"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
