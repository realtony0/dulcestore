import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatFCFA } from "@/lib/shipping";
import {
  saveCategory,
  deleteCategory,
  saveSubcategory,
  deleteSubcategory,
  deleteProduct,
  toggleStock,
} from "@/lib/admin-actions";

export const metadata: Metadata = { title: "Catalogue", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CataloguePage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { position: "asc" },
      include: {
        subcategories: { orderBy: { position: "asc" } },
        _count: { select: { products: true } },
      },
    }),
    prisma.product.findMany({
      orderBy: [{ categoryId: "asc" }, { position: "asc" }],
      include: { category: true, subcategory: true },
    }),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight">Produits</h1>
          <Link href="/admin/catalogue/produit/nouveau" className="btn-primary focus-ring text-sm">
            <Plus className="h-4 w-4" aria-hidden />
            Nouveau produit
          </Link>
        </div>
        <p className="mt-1 text-sm text-dulce-ink/50">{products.length} produits</p>

        <div className="mt-5 overflow-x-auto rounded-lg border border-dulce-border bg-white">
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="border-b border-dulce-border text-left">
              <tr>
                <th className="px-4 py-3 font-bold">Produit</th>
                <th className="px-4 py-3 font-bold">Catégorie</th>
                <th className="px-4 py-3 font-bold">Prix</th>
                <th className="px-4 py-3 font-bold">Stock</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-dulce-border/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-dulce-cream">
                        {p.imageUrl && (
                          <Image src={p.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p.name}</p>
                        <p className="truncate font-mono text-xs text-dulce-ink/40">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dulce-ink/70">
                    {p.category.name}
                    {p.subcategory && (
                      <span className="block text-xs text-dulce-ink/45">{p.subcategory.name}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-dulce-orange">
                    {formatFCFA(p.priceFCFA)}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleStock}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
                          p.inStock
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        {p.inStock ? "En stock" : "Masqué"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/catalogue/produit/${p.id}`}
                        className="focus-ring rounded p-2 text-dulce-ink/50 transition hover:bg-dulce-surface hover:text-dulce-orange"
                        aria-label={`Modifier ${p.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          aria-label={`Supprimer ${p.name}`}
                          className="focus-ring rounded p-2 text-dulce-ink/50 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-dulce-ink/50">
          Un produit déjà commandé n&apos;est pas supprimé mais masqué, pour ne pas casser
          l&apos;historique des commandes.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold tracking-tight">Catégories</h2>

        <div className="mt-5 space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-lg border border-dulce-border bg-white p-5">
              <form action={saveCategory} className="grid gap-3 sm:grid-cols-[1fr_1.4fr_5rem_auto]">
                <input type="hidden" name="id" value={cat.id} />
                <input name="name" defaultValue={cat.name} required className="field" aria-label="Nom" />
                <input
                  name="tagline"
                  defaultValue={cat.tagline}
                  className="field"
                  aria-label="Accroche"
                  placeholder="Accroche"
                />
                <input
                  name="position"
                  type="number"
                  defaultValue={cat.position}
                  className="field"
                  aria-label="Ordre"
                />
                <button type="submit" className="btn-ghost focus-ring whitespace-nowrap text-sm">
                  Enregistrer
                </button>
              </form>

              <div className="mt-4 border-t border-dulce-border pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-dulce-ink/40">
                  Sous-catégories
                </p>

                <div className="mt-3 space-y-2">
                  {cat.subcategories.map((sub) => (
                    <div key={sub.id} className="flex flex-wrap items-center gap-2">
                      <form action={saveSubcategory} className="flex flex-1 flex-wrap gap-2">
                        <input type="hidden" name="id" value={sub.id} />
                        <input type="hidden" name="categoryId" value={cat.id} />
                        <input
                          name="name"
                          defaultValue={sub.name}
                          required
                          className="field flex-1"
                          aria-label="Nom de la sous-catégorie"
                        />
                        <input
                          name="position"
                          type="number"
                          defaultValue={sub.position}
                          className="field w-20"
                          aria-label="Ordre"
                        />
                        <button type="submit" className="btn-ghost focus-ring text-sm">
                          OK
                        </button>
                      </form>
                      <form action={deleteSubcategory}>
                        <input type="hidden" name="id" value={sub.id} />
                        <button
                          type="submit"
                          aria-label={`Supprimer ${sub.name}`}
                          className="focus-ring rounded p-2 text-dulce-ink/40 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  ))}

                  <form action={saveSubcategory} className="flex flex-wrap gap-2">
                    <input type="hidden" name="categoryId" value={cat.id} />
                    <input
                      name="name"
                      required
                      placeholder="Ajouter une sous-catégorie…"
                      className="field flex-1"
                      aria-label="Nouvelle sous-catégorie"
                    />
                    <button type="submit" className="btn-ghost focus-ring text-sm">
                      <Plus className="h-4 w-4" aria-hidden />
                      Ajouter
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-dulce-border pt-3">
                <p className="text-xs text-dulce-ink/50">
                  {cat._count.products} produit{cat._count.products > 1 ? "s" : ""} · slug{" "}
                  <code className="font-mono">{cat.slug}</code>
                </p>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={cat.id} />
                  <button
                    type="submit"
                    className="focus-ring text-xs font-semibold text-dulce-ink/40 transition hover:text-red-600"
                  >
                    Supprimer la catégorie
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <form
          action={saveCategory}
          className="mt-5 grid gap-3 rounded-lg border border-dashed border-dulce-ink/25 bg-white p-5 sm:grid-cols-[1fr_1.4fr_auto]"
        >
          <input name="name" required placeholder="Nom de la catégorie" className="field" />
          <input name="tagline" placeholder="Accroche" className="field" />
          <button type="submit" className="btn-primary focus-ring whitespace-nowrap text-sm">
            <Plus className="h-4 w-4" aria-hidden />
            Créer la catégorie
          </button>
        </form>
      </section>
    </div>
  );
}
