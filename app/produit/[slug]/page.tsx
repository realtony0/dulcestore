import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/queries";
import { ProductDetail } from "@/components/product-detail";

type Props = { params: Promise<{ slug: string }> };

/**
 * Aucune fiche n'est pré-rendue au build.
 *
 * Interroger la base pour générer les 81 pages rendait chaque déploiement
 * dépendant de la disponibilité de Neon : une base momentanément injoignable
 * faisait échouer la mise en ligne, y compris pour un correctif urgent sans
 * rapport avec le catalogue.
 *
 * Les pages sont désormais rendues à la première visite puis mises en cache,
 * et rafraîchies toutes les heures. Le catalogue modifié depuis le back-office
 * reste immédiat : les actions d'administration invalident déjà le cache.
 */
export async function generateStaticParams() {
  return [];
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.tagline };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-8 text-sm text-dulce-ink/60">
        <Link href="/" className="hover:text-dulce-orange">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/boutique?categorie=${product.category.slug}`} className="hover:text-dulce-orange">
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-dulce-ink">{product.name}</span>
      </nav>

      <ProductDetail
        slug={product.slug}
        name={product.name}
        tagline={product.tagline}
        description={product.description}
        priceFCFA={product.priceFCFA}
        weightKg={product.weightKg}
        minOrderQty={product.minOrderQty}
        colors={product.colors}
        imageUrl={product.imageUrl}
        images={product.images}
        variants={product.variants}
        specs={product.specs}
      />
    </div>
  );
}
