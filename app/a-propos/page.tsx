import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Package, Store, Truck } from "lucide-react";
import { SITE } from "@/lib/site-config";
import { getCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Dulce Store : une plateforme de vente qui source en Chine pour les particuliers comme pour les professionnels, avec livraison au Sénégal et à l'international.",
};

const PILLARS = [
  {
    Icon: Store,
    title: "Particuliers et professionnels",
    text: "Un sac ou un cadeau pour l'un, du matériel de cuisine ou du packaging en volume pour l'autre : la même boutique répond aux deux besoins.",
  },
  {
    Icon: Package,
    title: "Sourcing direct en Chine",
    text: "Les produits viennent directement des fournisseurs, sans intermédiaire supplémentaire entre l'usine et vous.",
  },
  {
    Icon: Truck,
    title: "Trois modes d'acheminement",
    text: "Fret express pour l'urgence, fret standard pour l'équilibre prix-délai, cargo maritime pour les gros volumes.",
  },
];

export default async function AProposPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <nav className="text-sm text-dulce-ink/60">
        <Link href="/" className="hover:text-dulce-orange">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-dulce-ink">À propos</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {SITE.slogan}
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-dulce-ink/70">{SITE.pitch}</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {PILLARS.map(({ Icon, title, text }) => (
          <div key={title} className="rounded-lg border border-dulce-border bg-white p-6">
            <Icon className="h-6 w-6 text-dulce-orange" aria-hidden />
            <h2 className="mt-4 font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-dulce-ink/65">{text}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="section-title">Ce que nous vendons</h2>
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
              <div className="px-4 py-3.5">
                <h3 className="font-bold transition group-hover:text-dulce-orange">{cat.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-dulce-ink/55">{cat.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-lg border-2 border-dulce-orange bg-dulce-orange-light p-6">
        <h2 className="text-xl font-bold">Comment nous fonctionnons</h2>
        <p className="mt-3 leading-relaxed text-dulce-ink/80">
          Vous payez le <strong>prix des produits en ligne</strong> au moment de la commande. Les{" "}
          <strong>frais de livraison sont séparés</strong> et réglés à l&apos;arrivée, parce que
          leur montant dépend du poids ou du volume réel de votre colis — impossible à connaître
          avant que l&apos;envoi soit constitué.
        </p>
        <p className="mt-3 text-sm text-dulce-ink/70">
          C&apos;est notre principe de transparence : pas de frais gonflés « au cas où » dans le
          prix affiché.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/boutique" className="btn-primary focus-ring">
            Voir la boutique
          </Link>
          <Link href="/infos" className="btn-ghost focus-ring">
            Infos pratiques
          </Link>
        </div>
      </section>
    </div>
  );
}
