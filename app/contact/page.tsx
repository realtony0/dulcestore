import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MessageCircle } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter Dulce Store par WhatsApp ou par e-mail pour toute question sur une commande, un produit ou une livraison.",
};

/** Affiche +221 77 876 01 66 à partir du numéro stocké sans indicatif « + ». */
function formatPhone(raw: string): string {
  const m = raw.match(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}` : `+${raw}`;
}

const TOPICS = [
  "Une question sur un produit ou une quantité minimum",
  "Le montant des frais de livraison de votre commande",
  "Le suivi d'une commande déjà passée",
  "Une demande de devis pour un gros volume",
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-dulce-ink/60">
        <Link href="/" className="hover:text-dulce-orange">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-dulce-ink">Contact</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Nous contacter</h1>
      <p className="mt-2.5 text-lg text-dulce-ink/70">
        WhatsApp est notre canal principal : c&apos;est le plus rapide, et c&apos;est là que nous
        vous communiquons le montant de votre livraison.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href={whatsappLink("Bonjour Dulce Store, j'ai une question.")}
          target="_blank"
          rel="noreferrer"
          className="focus-ring group rounded-lg border-2 border-dulce-orange bg-dulce-orange-light p-6 transition hover:shadow-card"
        >
          <MessageCircle className="h-6 w-6 text-dulce-orange" aria-hidden />
          <h2 className="mt-4 font-bold">WhatsApp</h2>
          <p className="mt-1 text-lg font-extrabold text-dulce-orange">
            {formatPhone(SITE.whatsappNumber)}
          </p>
          <p className="mt-2 text-sm text-dulce-ink/70">
            Cliquez pour ouvrir la conversation directement.
          </p>
        </a>

        <a
          href={`mailto:${SITE.email}`}
          className="focus-ring group rounded-lg border border-dulce-border bg-white p-6 transition hover:border-dulce-orange/50 hover:shadow-card"
        >
          <Mail className="h-6 w-6 text-dulce-orange" aria-hidden />
          <h2 className="mt-4 font-bold">E-mail</h2>
          <p className="mt-1 font-semibold text-dulce-ink/80 group-hover:text-dulce-orange">
            {SITE.email}
          </p>
          <p className="mt-2 text-sm text-dulce-ink/70">
            Pour les demandes détaillées ou les devis en volume.
          </p>
        </a>
      </div>

      <section className="mt-10 rounded-lg border border-dulce-border bg-white p-6">
        <h2 className="text-xl font-bold">Nous écrire pour</h2>
        <ul className="mt-4 space-y-2.5">
          {TOPICS.map((t) => (
            <li key={t} className="flex gap-3 text-dulce-ink/75">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-dulce-orange" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-5 flex items-start gap-2.5 text-sm text-dulce-ink/60">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Pour toute question sur une commande, indiquez votre référence (format DS-XXXXXX) : le
          traitement en sera bien plus rapide.
        </p>
      </section>

      <section className="mt-6 rounded-lg bg-dulce-surface p-6">
        <h2 className="font-bold">Avant de nous écrire</h2>
        <p className="mt-2 text-sm text-dulce-ink/70">
          Les tarifs de livraison, les délais et les moyens de paiement sont détaillés sur la page
          infos pratiques — votre réponse s&apos;y trouve peut-être déjà.
        </p>
        <Link href="/infos" className="btn-ghost focus-ring mt-4 inline-flex">
          Voir les infos pratiques
        </Link>
      </section>
    </div>
  );
}
