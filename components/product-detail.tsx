"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatFCFA } from "@/lib/shipping";

type Variant = { id: string; name: string; priceFCFA: number; weightKg: number };
type ProductImage = { id: string; url: string; kind: string };
type Spec = { id: string; label: string; value: string };

type Props = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  priceFCFA: number;
  weightKg: number;
  minOrderQty: number;
  colors: string | null;
  imageUrl: string;
  images: ProductImage[];
  variants: Variant[];
  specs: Spec[];
};

export function ProductDetail(p: Props) {
  const { add } = useCart();
  const [variantId, setVariantId] = useState(p.variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(p.minOrderQty);
  const [added, setAdded] = useState(false);

  const variant = p.variants.find((v) => v.id === variantId) ?? null;
  const unitPrice = variant?.priceFCFA ?? p.priceFCFA;
  const unitWeight = variant?.weightKg ?? p.weightKg;

  const otherImages = p.images.filter((i) => i.url !== p.imageUrl);
  const gallery = [{ id: "main", url: p.imageUrl, kind: "photo" }, ...otherImages].filter((i) => i.url);
  const fiches = gallery.filter((i) => i.kind === "fiche");
  const [active, setActive] = useState(0);

  function handleAdd() {
    add({
      productSlug: p.slug,
      productName: p.name,
      variantId,
      variantName: variant?.name ?? null,
      unitPriceFCFA: unitPrice,
      unitWeightKg: unitWeight,
      imageUrl: p.imageUrl,
      minOrderQty: p.minOrderQty,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div className="grid gap-10 pb-24 lg:grid-cols-2 lg:pb-0">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-dulce-ink/10 bg-dulce-cream shadow-soft">
          {gallery[active] && (
            <Image
              src={gallery[active].url}
              alt={p.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain"
              priority
            />
          )}
        </div>

        {gallery.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {gallery.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(i)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 bg-dulce-cream transition ${
                  i === active ? "border-dulce-orange" : "border-transparent hover:border-dulce-ink/20"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="20vw" className="object-cover" />
              </button>
            ))}
          </div>
        )}

        {fiches.length > 0 && (
          <p className="mt-3 text-xs text-dulce-ink/50">
            Les dernières images sont les fiches techniques du fabricant (dimensions et caractéristiques).
          </p>
        )}
      </div>

      <div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{p.name}</h1>
        <p className="mt-2.5 text-lg text-dulce-orange">{p.tagline}</p>

        <p className="mt-6 text-4xl font-extrabold text-dulce-orange">{formatFCFA(unitPrice)}</p>
        {p.minOrderQty > 1 && (
          <p className="mt-1 text-sm font-medium text-dulce-ink/70">
            Minimum de commande : {p.minOrderQty} pièces
          </p>
        )}

        {p.variants.length > 0 && (
          <div className="mt-6">
            <p className="label">Choisissez votre option</p>
            <div className="flex flex-wrap gap-2">
              {p.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    v.id === variantId
                      ? "border-dulce-orange bg-dulce-orange-light text-dulce-orange"
                      : "border-dulce-ink/15 hover:border-dulce-orange"
                  }`}
                >
                  {v.name}
                  <span className="ml-2 font-bold">{formatFCFA(v.priceFCFA)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {p.colors && (
          <div className="mt-6">
            <p className="label">Coloris disponibles</p>
            <div className="flex flex-wrap gap-2">
              {p.colors.split(", ").map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-dulce-ink/15 px-3 py-1.5 text-sm text-dulce-ink/80"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-dulce-ink/50">
              Précisez le coloris souhaité sur WhatsApp après votre commande.
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border border-dulce-ink/15">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(p.minOrderQty, q - (p.minOrderQty > 1 ? p.minOrderQty : 1)))}
              className="px-4 py-3 text-lg font-bold text-dulce-ink/60 hover:text-dulce-orange"
              aria-label="Diminuer la quantité"
            >
              −
            </button>
            <span className="min-w-[3.5rem] text-center font-semibold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + (p.minOrderQty > 1 ? p.minOrderQty : 1))}
              className="px-4 py-3 text-lg font-bold text-dulce-ink/60 hover:text-dulce-orange"
              aria-label="Augmenter la quantité"
            >
              +
            </button>
          </div>

          <button type="button" onClick={handleAdd} className="btn-primary flex-1">
            {added && <Check className="h-4 w-4" aria-hidden />}
            {added ? "Ajouté au panier" : "Ajouter au panier"}
          </button>
        </div>

        {added && (
          <Link href="/panier" className="mt-3 block text-center text-sm font-semibold text-dulce-orange hover:underline">
            Voir mon panier →
          </Link>
        )}

        <div className="mt-6 rounded-2xl bg-dulce-orange-light p-5 text-sm">
          <p className="font-semibold">Prix produit et livraison sont séparés</p>
          <p className="mt-1 text-dulce-ink/70">
            Vous payez {formatFCFA(unitPrice * quantity)} en ligne pour cette commande. Les frais de
            livraison dépendent du poids ou du volume du colis et sont réglés à l&apos;arrivée.{" "}
            <Link href="/infos" className="font-semibold text-dulce-orange hover:underline">
              Voir les tarifs
            </Link>
          </p>
          <p className="mt-2 text-xs text-dulce-ink/60">
            Poids indicatif de cette ligne : {(unitWeight * quantity).toFixed(2)} kg
          </p>
        </div>

        <div className="mt-8">
          <h2 className="font-bold">Description</h2>
          <p className="mt-2 whitespace-pre-line text-dulce-ink/75">{p.description}</p>
        </div>

        {p.specs.length > 0 && (
          <div className="mt-8">
            <h2 className="font-bold">Caractéristiques</h2>
            <dl className="mt-3 divide-y divide-dulce-ink/10 overflow-hidden rounded-2xl border border-dulce-ink/10">
              {p.specs.map((s) => (
                <div key={s.id} className="grid grid-cols-[8rem_1fr] gap-4 px-4 py-3.5 text-sm odd:bg-dulce-cream/50 sm:grid-cols-[11rem_1fr]">
                  <dt className="text-dulce-ink/60">{s.label}</dt>
                  <dd className="font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {/* Barre d'achat fixe sur mobile : la fiche est longue, le bouton d'ajout
          resterait sinon hors écran pendant la lecture des caractéristiques. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-dulce-ink/10 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_-8px_rgb(43_33_25/0.25)] backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-dulce-ink/60">{p.name}</p>
          <p className="text-lg font-extrabold leading-tight text-dulce-orange">
            {formatFCFA(unitPrice * quantity)}
          </p>
        </div>
        <button type="button" onClick={handleAdd} className="btn-primary focus-ring shrink-0">
          {added && <Check className="h-4 w-4" aria-hidden />}
          {added ? "Ajouté" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
