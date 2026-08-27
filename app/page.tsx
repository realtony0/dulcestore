import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, ShieldCheck, Timer } from "lucide-react";
import { getCategories, getFeaturedProducts } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { SITE } from "@/lib/site-config";

/** Visuels du hero : deux photos propres, alignées. */
const HERO_IMAGES = [
  { src: "/produits/bracelet-montre-perle/photo-1.jpeg", alt: "Bracelet montre à perle" },
  { src: "/produits/machine-popcorn/photo-1.jpeg", alt: "Machine à popcorn" },
  { src: "/produits/brosse-lymphatique-visage/photo-1.jpeg", alt: "Brosse lymphatique" },
  { src: "/produits/flacon-serum/photo-1.jpeg", alt: "Flacons à sérum" },
];

const HERO_POINTS = [
  { Icon: ShieldCheck, label: "Paiement sécurisé" },
  { Icon: Timer, label: "Fret express en 3 à 5 jours" },
  { Icon: Package, label: "Du détail au gros volume" },
];

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(10)]);

  return (
    <>
      {/* Hero sombre : le orange de la marque ressort nettement mieux sur
          l'encre que sur un fond crème, et l'ensemble fait moins « template ». */}
      <section className="bg-dulce-ink text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl xl:text-[3.75rem]">
              {SITE.slogan}
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">{SITE.pitch}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/boutique" className="btn-primary focus-ring">
                Voir le catalogue
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/infos"
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-6 py-3 font-semibold text-white transition hover:border-white/60 hover:bg-white/5"
              >
                Tarifs de livraison
              </Link>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-6">
              {HERO_POINTS.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-white/70">
                  <Icon className="h-4 w-4 shrink-0 text-dulce-orange" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {HERO_IMAGES.map((img, i) => (
              <div
                key={img.src}
                className="relative aspect-square overflow-hidden rounded-xl bg-white/5"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 1024px) 45vw, 24vw"
                  className="object-cover"
                  priority={i < 2}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="section-title">Nos catégories</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/boutique?categorie=${cat.slug}`}
              className="card focus-ring group overflow-hidden"
            >
              <div className="relative aspect-[5/4] overflow-hidden bg-dulce-cream">
                {cat.products[0]?.imageUrl && (
                  <Image
                    src={cat.products[0].imageUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 1024px) 45vw, 24vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                <div className="min-w-0">
                  <h3 className="truncate font-bold transition group-hover:text-dulce-orange">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-dulce-ink/50">
                    {cat._count.products} produit{cat._count.products > 1 ? "s" : ""}
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-dulce-ink/25 transition group-hover:translate-x-0.5 group-hover:text-dulce-orange"
                  aria-hidden
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="section-title">Nos produits</h2>
          <Link
            href="/boutique"
            className="focus-ring shrink-0 rounded text-sm font-bold text-dulce-orange transition hover:text-dulce-orange-dark"
          >
            Tout voir →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {featured.map((p) => (
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
      </section>

      <section className="border-t border-dulce-border bg-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="section-title">Comment ça marche</h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-3">
            {[
              {
                n: "1",
                t: "Vous commandez sur le site",
                d: "Vous payez uniquement le prix des produits, par Wave, Orange Money, carte bancaire ou PayPal.",
              },
              {
                n: "2",
                t: "Nous expédions depuis la Chine",
                d: "Fret express, fret ou cargo maritime selon le mode que vous avez choisi.",
              },
              {
                n: "3",
                t: "Vous réglez la livraison à l'arrivée",
                d: "Les frais de livraison dépendent du poids ou du volume réel de votre colis.",
              },
            ].map((step) => (
              <div key={step.n} className="border-t-2 border-dulce-orange pt-4">
                <span className="text-sm font-extrabold text-dulce-orange">{step.n}</span>
                <h3 className="mt-1.5 font-bold">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dulce-ink/65">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
