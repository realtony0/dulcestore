import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts, getCategories } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";

type Props = { searchParams: Promise<{ categorie?: string }> };

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Tous les produits Dulce Store : cuisine professionnelle, packaging, accessoires et beauté, livrés depuis la Chine.",
};

export default async function BoutiquePage({ searchParams }: Props) {
  const { categorie } = await searchParams;
  const categories = await getCategories();

  if (categorie && !categories.some((c) => c.slug === categorie)) notFound();

  const products = await getAllProducts(categorie);
  const active = categories.find((c) => c.slug === categorie);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="text-sm text-dulce-ink/60">
        <Link href="/" className="hover:text-dulce-orange">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-dulce-ink">Boutique</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {active ? active.name : "Boutique"}
      </h1>
      <p className="mt-2 text-dulce-ink/70">
        {active ? active.tagline : "Tous nos produits, du détail au gros volume."}
      </p>

      <div className="mt-7 flex flex-wrap gap-2">
        <Link
          href="/boutique"
          className={`focus-ring rounded-lg border px-4 py-2 text-sm font-semibold transition ${
            !categorie
              ? "border-dulce-orange bg-dulce-orange-light text-dulce-orange"
              : "border-dulce-ink/15 bg-white hover:border-dulce-orange hover:text-dulce-orange"
          }`}
        >
          Tout ({categories.reduce((n, c) => n + c._count.products, 0)})
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/boutique?categorie=${c.slug}`}
            className={`focus-ring rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              categorie === c.slug
                ? "border-dulce-orange bg-dulce-orange-light text-dulce-orange"
                : "border-dulce-ink/15 bg-white hover:border-dulce-orange hover:text-dulce-orange"
            }`}
          >
            {c.name} ({c._count.products})
          </Link>
        ))}
      </div>

      <p className="mt-6 text-sm font-semibold text-dulce-ink/50">
        {products.length} produit{products.length > 1 ? "s" : ""}
      </p>

      {/* Sur une catégorie filtrée, on regroupe par sous-catégorie : c'est là
          que le découpage a du sens. En vue « Tout », une grille plate suffit. */}
      {active ? (
        active.subcategories
          .map((sub) => ({ sub, items: products.filter((p) => p.subcategoryId === sub.id) }))
          .filter(({ items }) => items.length > 0)
          .map(({ sub, items }) => (
            <section key={sub.id} id={sub.slug} className="mt-10 scroll-mt-28">
              <h2 className="text-lg font-bold sm:text-xl">{sub.name}</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((p) => (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    name={p.name}
                    tagline={p.tagline}
                    imageUrl={p.imageUrl}
                    priceFCFA={p.priceFCFA}
                    hasVariants={p.variants.length > 0}
                    minOrderQty={p.minOrderQty}
                  />
                ))}
              </div>
            </section>
          ))
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              tagline={p.tagline}
              imageUrl={p.imageUrl}
              priceFCFA={p.priceFCFA}
              hasVariants={p.variants.length > 0}
              minOrderQty={p.minOrderQty}
              categoryName={p.category.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
