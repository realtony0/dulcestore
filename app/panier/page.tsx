"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatFCFA } from "@/lib/shipping";

export default function CartPage() {
  const { lines, setQuantity, remove, totalFCFA, totalWeightKg, ready } = useCart();

  if (!ready) return <div className="mx-auto max-w-4xl px-4 py-16" />;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-dulce-surface">
          <ShoppingBag className="h-8 w-8 text-dulce-ink/40" aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">Votre panier est vide</h1>
        <p className="mt-3 text-dulce-ink/70">Parcourez nos catégories pour trouver votre bonheur.</p>
        <Link href="/" className="btn-primary focus-ring mt-8">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Votre panier</h1>
      <p className="mt-2 text-dulce-ink/60">
        {lines.length} article{lines.length > 1 ? "s" : ""}
      </p>

      <div className="mt-8 space-y-4">
        {lines.map((line) => (
          <div
            key={line.key}
            className="flex gap-4 rounded-2xl border border-dulce-ink/10 p-4 shadow-soft transition hover:border-dulce-orange/30"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-dulce-cream">
              {line.imageUrl && (
                <Image src={line.imageUrl} alt={line.productName} fill sizes="96px" className="object-cover" />
              )}
            </div>

            <div className="flex-1">
              <Link href={`/produit/${line.productSlug}`} className="font-semibold hover:text-dulce-orange">
                {line.productName}
              </Link>
              {line.variantName && <p className="text-sm text-dulce-ink/60">{line.variantName}</p>}
              <p className="mt-1 text-sm text-dulce-ink/60">
                {formatFCFA(line.unitPriceFCFA)} l&apos;unité
                {line.minOrderQty > 1 && ` · minimum ${line.minOrderQty} pièces`}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-lg border border-dulce-ink/15">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(line.key, line.quantity - (line.minOrderQty > 1 ? line.minOrderQty : 1))
                    }
                    className="px-3 py-1.5 font-bold text-dulce-ink/60 hover:text-dulce-orange"
                    aria-label="Diminuer"
                  >
                    −
                  </button>
                  <span className="min-w-[3rem] text-center text-sm font-semibold">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(line.key, line.quantity + (line.minOrderQty > 1 ? line.minOrderQty : 1))
                    }
                    className="px-3 py-1.5 font-bold text-dulce-ink/60 hover:text-dulce-orange"
                    aria-label="Augmenter"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(line.key)}
                  className="text-sm text-dulce-ink/50 hover:text-red-600"
                >
                  Retirer
                </button>
              </div>
            </div>

            <p className="shrink-0 font-bold text-dulce-orange">
              {formatFCFA(line.unitPriceFCFA * line.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-dulce-ink/10 p-6 shadow-soft">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">Total produits</span>
          <span className="text-3xl font-extrabold text-dulce-orange">{formatFCFA(totalFCFA)}</span>
        </div>
        <p className="mt-1 text-sm text-dulce-ink/60">
          Poids total estimé : {totalWeightKg.toFixed(2)} kg
        </p>

        <div className="mt-5 rounded-xl bg-dulce-orange-light p-4 text-sm">
          <p className="font-semibold">Les frais de livraison ne sont pas inclus</p>
          <p className="mt-1 text-dulce-ink/70">
            Vous payez maintenant uniquement le prix des produits. Les frais de livraison sont calculés
            selon le poids ou le volume réel du colis et réglés à l&apos;arrivée.{" "}
            <Link href="/infos" className="font-semibold text-dulce-orange hover:underline">
              Voir les tarifs
            </Link>
          </p>
        </div>

        <Link href="/commande" className="btn-primary focus-ring mt-6 w-full">
          Passer la commande →
        </Link>
      </div>
    </div>
  );
}
