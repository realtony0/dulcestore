import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug, getAllProductSlugs } from "@/lib/queries";
import { ProductDetail } from "@/components/product-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getAllProductSlugs();
  return products.map((p) => ({ slug: p.slug }));
}

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
