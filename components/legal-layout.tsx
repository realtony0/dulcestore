import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { LEGAL, isLegalComplete } from "@/lib/site-config";

/**
 * Coquille commune aux pages légales (mentions légales, CGV, confidentialité) :
 * fil d'Ariane, titre, date de mise à jour et typographie de lecture.
 */
export function LegalLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-dulce-ink/60">
        <Link href="/" className="hover:text-dulce-orange">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-dulce-ink">{title}</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2.5 text-lg text-dulce-ink/70">{intro}</p>
      <p className="mt-2 text-sm text-dulce-ink/50">
        Dernière mise à jour : {LEGAL.miseAJour}
      </p>

      {!isLegalComplete() && (
        <div className="mt-8 flex items-start gap-4 rounded-lg border-2 border-amber-400 bg-amber-50 p-5">
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden />
          <div className="text-sm">
            <p className="font-bold text-amber-900">Document en cours de finalisation</p>
            <p className="mt-1 leading-relaxed text-amber-900/80">
              Les informations d&apos;immatriculation de l&apos;entreprise sont en cours
              d&apos;intégration. Pour toute question sur ce document, contactez-nous.
            </p>
          </div>
        </div>
      )}

      <div className="mt-10 space-y-10">{children}</div>
    </div>
  );
}

/** Section numérotée d'un document légal. */
export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-dulce-ink/80">{children}</div>
    </section>
  );
}

/** Ligne d'un tableau d'identité (« Raison sociale : … »). */
export function LegalField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-4 px-4 py-3 text-sm odd:bg-dulce-cream/50 sm:grid-cols-[13rem_1fr]">
      <dt className="text-dulce-ink/60">{label}</dt>
      <dd className="font-semibold">
        {value.trim() ? value : <span className="font-normal text-dulce-ink/40">—</span>}
      </dd>
    </div>
  );
}
