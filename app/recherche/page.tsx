import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { searchProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";

type Props = { searchParams: Promise<{ q?: string }> };

export const metadata: Metadata = { title: "Recherche" };

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchProducts(query) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {query ? (
          <>
            Résultats pour <span className="text-dulce-orange">« {query} »</span>
          </>
        ) : (
          "Recherche"
        )}
      </h1>
      <p className="mt-1.5 text-sm text-dulce-ink/60">
        {results.length} produit{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
      </p>

      {results.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <SearchX className="h-12 w-12 text-dulce-ink/25" aria-hidden />
          <p className="mt-4 text-lg font-semibold">Aucun produit trouvé</p>
          <p className="mt-1 max-w-sm text-sm text-dulce-ink/60">
            Essayez un autre mot-clé, ou parcourez nos catégories depuis le menu.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((p) => (
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
