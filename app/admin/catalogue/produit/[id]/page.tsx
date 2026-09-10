import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { saveProduct } from "@/lib/admin-actions";
import { AdminForm, SubmitButton } from "@/components/admin-form";
import { isR2Configured } from "@/lib/r2";

export const metadata: Metadata = { title: "Produit", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ProduitFormPage({ params }: Props) {
  const { id } = await params;
  const creation = id === "nouveau";

  const [product, categories] = await Promise.all([
    creation
      ? null
      : prisma.product.findUnique({ where: { id }, include: { subcategory: true } }),
    prisma.category.findMany({
      orderBy: { position: "asc" },
      include: { subcategories: { orderBy: { position: "asc" } } },
    }),
  ]);

  if (!creation && !product) notFound();

  const uploadDispo = isR2Configured();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/catalogue" className="text-sm text-dulce-ink/55 hover:text-dulce-orange">
        ← Retour au catalogue
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
        {creation ? "Nouveau produit" : product!.name}
      </h1>

      <AdminForm action={saveProduct} className="mt-7 space-y-6">
        {!creation && <input type="hidden" name="id" value={product!.id} />}

        <div className="rounded-lg border border-dulce-border bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="name">
                Nom du produit *
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={product?.name}
                className="field"
                placeholder="Crêpière à gaz"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="tagline">
                Accroche
              </label>
              <input
                id="tagline"
                name="tagline"
                defaultValue={product?.tagline}
                className="field"
                placeholder="Idéale pour vos crêpes parfaites"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={product?.description}
                className="field"
              />
            </div>

            <div>
              <label className="label" htmlFor="categoryId">
                Catégorie *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                defaultValue={product?.categoryId ?? ""}
                className="field"
              >
                <option value="">— Choisir —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="subcategoryId">
                Sous-catégorie
              </label>
              <select
                id="subcategoryId"
                name="subcategoryId"
                defaultValue={product?.subcategoryId ?? ""}
                className="field"
              >
                <option value="">— Aucune —</option>
                {categories.map((c) => (
                  <optgroup key={c.id} label={c.name}>
                    {c.subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="mt-1 text-xs text-dulce-ink/50">
                Doit appartenir à la catégorie choisie ci-contre.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-dulce-border bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-dulce-ink/40">
            Prix et logistique
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="priceFCFA">
                Prix (FCFA) *
              </label>
              <input
                id="priceFCFA"
                name="priceFCFA"
                type="number"
                min="0"
                required
                defaultValue={product?.priceFCFA}
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor="weightKg">
                Poids (kg) *
              </label>
              <input
                id="weightKg"
                name="weightKg"
                type="number"
                step="0.001"
                min="0"
                required
                defaultValue={product?.weightKg}
                className="field"
              />
              <p className="mt-1 text-xs text-dulce-ink/50">Sert au calcul du fret.</p>
            </div>
            <div>
              <label className="label" htmlFor="minOrderQty">
                Quantité min.
              </label>
              <input
                id="minOrderQty"
                name="minOrderQty"
                type="number"
                min="1"
                defaultValue={product?.minOrderQty ?? 1}
                className="field"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="colors">
                Coloris disponibles
              </label>
              <input
                id="colors"
                name="colors"
                defaultValue={product?.colors ?? ""}
                className="field"
                placeholder="Blanc, Rose, Vert"
              />
            </div>
            <div>
              <label className="label" htmlFor="position">
                Ordre d&apos;affichage
              </label>
              <input
                id="position"
                name="position"
                type="number"
                defaultValue={product?.position ?? 0}
                className="field"
              />
            </div>
          </div>

          <label className="mt-5 flex items-center gap-2.5 text-sm font-semibold">
            <input
              type="checkbox"
              name="inStock"
              defaultChecked={product?.inStock ?? true}
              className="h-4 w-4 accent-dulce-orange"
            />
            Visible en boutique
          </label>
        </div>

        <div className="rounded-lg border border-dulce-border bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-dulce-ink/40">Photo</p>

          {product?.imageUrl && (
            <div className="mt-4 flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-dulce-cream">
                <Image src={product.imageUrl} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <p className="min-w-0 break-all font-mono text-xs text-dulce-ink/45">
                {product.imageUrl}
              </p>
            </div>
          )}

          {uploadDispo ? (
            <div className="mt-4">
              <label className="label" htmlFor="imageFile">
                Envoyer une nouvelle photo
              </label>
              <input
                id="imageFile"
                name="imageFile"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="field"
              />
              <p className="mt-1 text-xs text-dulce-ink/50">
                JPEG, PNG, WebP ou AVIF — 5 Mo maximum. Laissez vide pour conserver la photo
                actuelle.
              </p>
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              L&apos;envoi de fichiers n&apos;est pas encore actif : les variables{" "}
              <code className="font-mono">R2_*</code> ne sont pas configurées. En attendant, collez
              l&apos;adresse d&apos;une image déjà en ligne ci-dessous.
            </p>
          )}

          <div className="mt-4">
            <label className="label" htmlFor="imageUrl">
              {uploadDispo ? "…ou coller une adresse d’image" : "Adresse de l’image *"}
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              defaultValue={product?.imageUrl ?? ""}
              className="field"
              placeholder="/produits/mon-produit/photo-1.jpeg"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <SubmitButton pendingLabel="Enregistrement…">
            {creation ? "Créer le produit" : "Enregistrer les modifications"}
          </SubmitButton>
          <Link href="/admin/catalogue" className="btn-ghost focus-ring">
            Annuler
          </Link>
        </div>
      </AdminForm>
    </div>
  );
}
