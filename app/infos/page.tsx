import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { SHIPPING_METHODS, EUROPE_USA_STEPS, formatFCFA } from "@/lib/shipping";
import { PAYMENT_METHODS } from "@/lib/site-config";
import { PaymentIcon, ShippingIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Infos pratiques",
  description:
    "Livraison, tarifs de fret et cargo maritime, moyens de paiement et déroulé d'une commande chez Dulce Store.",
};

export default function InfosPage() {
  const senegal = SHIPPING_METHODS.filter((m) => m.destination === "SENEGAL");
  const international = SHIPPING_METHODS.filter((m) => m.destination === "EUROPE_USA");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="text-sm text-dulce-ink/60">
        <Link href="/" className="hover:text-dulce-orange">
          Accueil
        </Link>
        <span className="mx-2">/</span>
        <span className="text-dulce-ink">Infos pratiques</span>
      </nav>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Infos pratiques</h1>
      <p className="mt-2.5 text-lg text-dulce-ink/70">
        Commandez depuis la Chine, faites-vous livrer au Sénégal ou partout dans le monde.
      </p>

      <div className="mt-8 flex items-start gap-4 rounded-lg border-2 border-dulce-orange bg-dulce-orange-light p-5">
        <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-dulce-orange" aria-hidden />
        <div>
          <p className="font-bold">À lire avant de commander</p>
          <p className="mt-1.5 text-sm leading-relaxed text-dulce-ink/80">
            Le <strong>prix du produit</strong> est payé en ligne au moment de la commande. Les{" "}
            <strong>frais de livraison sont séparés</strong> et réglés{" "}
            <strong>à l&apos;arrivée du colis</strong>, selon le mode choisi et le poids ou le volume
            réel.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="section-title">Livraison au Sénégal</h2>
        <div className="mt-5 space-y-4">
          {senegal.map((m) => (
            <div
              key={m.id}
              className="rounded-lg border border-dulce-border bg-white p-6 shadow-soft transition hover:border-dulce-orange/40"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <ShippingIcon id={m.id} className="h-5 w-5 text-dulce-orange" />
                  {m.name}
                </h3>
                <p className="text-2xl font-extrabold text-dulce-orange">
                  {formatFCFA(m.rate!.amountFCFA)}
                  <span className="text-base font-bold"> / {m.rate!.unit}</span>
                </p>
              </div>
              {m.delay && (
                <p className="mt-2 text-sm font-medium text-dulce-ink/70">
                  Délai estimatif : {m.delay}
                </p>
              )}
              <p className="mt-2 text-sm text-dulce-ink/60">{m.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-dulce-ink/60">
          Le montant définitif dépend du poids réel (pour le fret) ou du volume en mètres cubes
          (pour le cargo maritime) de votre colis, constaté après constitution de l&apos;envoi.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="section-title">Europe et États-Unis</h2>
        {international.map((m) => (
          <div key={m.id} className="mt-5 rounded-lg border border-dulce-border bg-white p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <ShippingIcon id={m.id} className="h-5 w-5 text-dulce-orange" />
              {m.name}
            </h3>
            <p className="mt-2 text-dulce-ink/70">{m.note}</p>
            <p className="mt-4 font-semibold">Le tarif n&apos;est pas affiché automatiquement.</p>
            <ol className="mt-3 space-y-2">
              {EUROPE_USA_STEPS.map((step, i) => (
                <li key={step} className="flex gap-3 text-sm text-dulce-ink/80">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dulce-orange text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="section-title">Moyens de paiement</h2>
        <p className="mt-2 text-dulce-ink/70">
          Le paiement du produit se fait directement sur le site :
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PAYMENT_METHODS.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-dulce-border bg-white px-5 py-4"
            >
              <PaymentIcon method={p.icon} />
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-dulce-ink/60">{p.hint}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-dulce-ink/60">
          Les frais de livraison, eux, sont séparés et payés à l&apos;arrivée pour le Sénégal.
        </p>
      </section>

      <section className="mt-12 rounded-lg border border-dulce-border bg-white p-6">
        <h2 className="text-xl font-bold">Une question ?</h2>
        <p className="mt-2 text-dulce-ink/70">
          Écrivez-nous, nous répondons sur WhatsApp.
        </p>
        <Link href="/contact" className="btn-primary focus-ring mt-4 inline-flex">
          Nous contacter
        </Link>
      </section>
    </div>
  );
}
