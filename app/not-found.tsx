import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-dulce-surface">
        <SearchX className="h-10 w-10 text-dulce-ink/40" aria-hidden />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">Page introuvable</h1>
      <p className="mt-3 text-dulce-ink/70">
        Ce produit ou cette page n&apos;existe pas ou plus. Retournez à la boutique pour continuer vos
        achats.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Retour à l&apos;accueil
        </Link>
        <Link href="/boutique" className="btn-ghost">
          Voir le catalogue
        </Link>
      </div>
    </div>
  );
}
