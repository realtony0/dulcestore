"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import {
  EUROPE_USA_STEPS,
  estimateShippingFCFA,
  formatFCFA,
  methodsForDestination,
  type Destination,
} from "@/lib/shipping";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/lib/site-config";
import { PaymentIcon, ShippingIcon } from "@/components/icons";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, totalFCFA, totalWeightKg, ready } = useCart();

  const [destination, setDestination] = useState<Destination>("SENEGAL");
  const [shippingMethodId, setShippingMethodId] = useState("FRET");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("WAVE");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = methodsForDestination(destination);
  const selectedMethod = methods.find((m) => m.id === shippingMethodId) ?? methods[0];

  // Changer de destination invalide le mode de livraison précédemment choisi.
  useEffect(() => {
    setShippingMethodId(methodsForDestination(destination)[0].id);
  }, [destination]);

  if (!ready) return <div className="mx-auto max-w-5xl px-4 py-16" />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="text-3xl font-extrabold">Votre panier est vide</h1>
        <p className="mt-3 text-dulce-ink/70">
          Ajoutez des produits à votre panier avant de passer commande.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const shippingEstimate = selectedMethod ? estimateShippingFCFA(selectedMethod, totalWeightKg) : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.get("customerName"),
          customerPhone: formData.get("customerPhone"),
          customerEmail: formData.get("customerEmail"),
          customerCity: formData.get("customerCity"),
          customerAddress: formData.get("customerAddress"),
          destination,
          shippingMethod: shippingMethodId,
          paymentMethod,
          items: lines.map((l) => ({
            productSlug: l.productSlug,
            variantId: l.variantId,
            quantity: l.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "La commande n'a pas pu être enregistrée.");
        setSubmitting(false);
        return;
      }

      // Le panier est vidé sur la page de confirmation, une fois la commande sûre.
      router.push(data.redirectUrl);
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Finaliser la commande</h1>

      <div className="mt-6 rounded-2xl border-2 border-dulce-orange bg-dulce-orange-light p-5 shadow-soft">
        <p className="font-bold">Vous payez maintenant le prix des produits uniquement.</p>
        <p className="mt-1 text-sm text-dulce-ink/80">
          Les <strong>frais de livraison sont séparés</strong> et réglés{" "}
          <strong>à l&apos;arrivée du colis</strong>, selon le mode choisi et le poids ou le volume
          réel.{" "}
          <Link href="/infos" className="font-semibold text-dulce-orange hover:underline">
            Voir les tarifs
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-8">
          <section>
            <h2 className="flex items-center gap-3 text-xl font-bold">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dulce-orange text-sm font-extrabold text-white">
                1
              </span>
              Vos informations
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="customerName">
                  Nom complet *
                </label>
                <input id="customerName" name="customerName" required className="field" />
              </div>
              <div>
                <label className="label" htmlFor="customerPhone">
                  Téléphone (WhatsApp) *
                </label>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  required
                  placeholder="+221 77 000 00 00"
                  className="field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="customerEmail">
                  E-mail (facultatif)
                </label>
                <input id="customerEmail" name="customerEmail" type="email" className="field" />
              </div>
            </div>
            <p className="mt-2 text-sm text-dulce-ink/60">
              C&apos;est sur ce numéro WhatsApp que nous vous communiquerons le montant de la livraison.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-xl font-bold">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dulce-orange text-sm font-extrabold text-white">
                2
              </span>
              Destination et livraison
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  { id: "SENEGAL", label: "Sénégal", hint: "Fret, fret express ou cargo maritime" },
                  { id: "EUROPE_USA", label: "Europe / USA", hint: "Fret international uniquement" },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDestination(option.id)}
                  className={`option-card focus-ring ${
                    destination === option.id ? "option-card-active" : "option-card-idle"
                  }`}
                >
                  <p className="font-bold">{option.label}</p>
                  <p className="mt-0.5 text-sm text-dulce-ink/60">{option.hint}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="customerCity">
                  Ville *
                </label>
                <input id="customerCity" name="customerCity" required className="field" />
              </div>
              <div>
                <label className="label" htmlFor="customerAddress">
                  Adresse / quartier (facultatif)
                </label>
                <input id="customerAddress" name="customerAddress" className="field" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {methods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setShippingMethodId(method.id)}
                  className={`option-card focus-ring flex w-full flex-wrap items-baseline justify-between gap-2 ${
                    shippingMethodId === method.id ? "option-card-active" : "option-card-idle"
                  }`}
                >
                  <span>
                    <span className="flex items-center gap-2 font-bold">
                      <ShippingIcon id={method.id} className="h-4 w-4 text-dulce-orange" />
                      {method.name}
                    </span>
                    {method.delay && (
                      <span className="block text-sm text-dulce-ink/60">
                        Délai estimatif : {method.delay}
                      </span>
                    )}
                  </span>
                  <span className="font-bold text-dulce-orange">
                    {method.rate
                      ? `${formatFCFA(method.rate.amountFCFA)} / ${method.rate.unit}`
                      : "Tarif communiqué après commande"}
                  </span>
                </button>
              ))}
            </div>

            {destination === "EUROPE_USA" && (
              <ol className="mt-4 space-y-2 rounded-xl bg-dulce-cream p-5">
                {EUROPE_USA_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm text-dulce-ink/80">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dulce-orange text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-xl font-bold">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dulce-orange text-sm font-extrabold text-white">
                3
              </span>
              Paiement des produits
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`option-card focus-ring ${
                    paymentMethod === method.id ? "option-card-active" : "option-card-idle"
                  }`}
                >
                  <p className="flex items-center gap-2 font-bold">
                    <PaymentIcon method={method.icon} />
                    {method.name}
                  </p>
                  <p className="mt-0.5 text-sm text-dulce-ink/60">{method.hint}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="rounded-2xl border border-dulce-ink/10 p-6 shadow-soft lg:sticky lg:top-32">
          <h2 className="font-bold">Récapitulatif</h2>

          <ul className="mt-4 space-y-3">
            {lines.map((line) => (
              <li key={line.key} className="flex justify-between gap-3 text-sm">
                <span>
                  {line.productName}
                  {line.variantName && (
                    <span className="block text-dulce-ink/60">{line.variantName}</span>
                  )}
                  <span className="text-dulce-ink/60"> × {line.quantity}</span>
                </span>
                <span className="shrink-0 font-semibold">
                  {formatFCFA(line.unitPriceFCFA * line.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-dulce-ink/10 pt-5">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">À payer maintenant</span>
              <span className="text-2xl font-extrabold text-dulce-orange">
                {formatFCFA(totalFCFA)}
              </span>
            </div>
            <p className="mt-1 text-sm text-dulce-ink/60">
              Poids total estimé : {totalWeightKg.toFixed(2)} kg
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-dulce-cream p-4 text-sm">
            <p className="font-semibold">Livraison — à payer à l&apos;arrivée</p>
            {shippingEstimate !== null ? (
              <p className="mt-1 text-dulce-ink/70">
                Estimation : <strong>{formatFCFA(shippingEstimate)}</strong> pour{" "}
                {totalWeightKg.toFixed(2)} kg. Le montant définitif est fixé après pesée réelle du
                colis.
              </p>
            ) : (
              <p className="mt-1 text-dulce-ink/70">
                {selectedMethod?.rate?.unit === "CBM"
                  ? `${formatFCFA(selectedMethod.rate.amountFCFA)} / CBM. Le montant dépend du volume réel de votre colis et vous est communiqué par WhatsApp.`
                  : "Le montant vous est communiqué par WhatsApp après validation de la commande."}
              </p>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary focus-ring mt-5 w-full">
            {submitting ? "Enregistrement…" : `Payer ${formatFCFA(totalFCFA)}`}
          </button>

          <Link
            href="/panier"
            className="mt-3 block text-center text-sm text-dulce-ink/60 hover:text-dulce-orange"
          >
            Modifier mon panier
          </Link>
        </aside>
      </form>
    </div>
  );
}
