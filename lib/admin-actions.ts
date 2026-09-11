"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { isAuthenticated } from "./admin-auth";
import { uploadImage, deleteImage, isR2Configured } from "./r2";

/**
 * Écritures du back-office. Chaque action revérifie la session : une action
 * serveur est une route HTTP à part entière, la protection de la page ne suffit
 * pas à la sécuriser.
 *
 * Aucune action ne touche aux commandes.
 */

/**
 * Toute action retourne son erreur au lieu de la lever : une exception non
 * rattrapée dans une action serveur devient, en production, une page
 * « Application error » opaque qui fait perdre sa saisie à l'utilisateur.
 */
export type ActionResult = { error?: string };

async function requireAdmin() {
  if (!(await isAuthenticated())) throw new Error("Session expirée, reconnectez-vous.");
}

function fail(e: unknown): ActionResult {
  const message = e instanceof Error ? e.message : "Erreur inattendue.";
  console.error("[admin]", message, e);
  return { error: message };
}

/** "Crêpière à gaz" → "crepiere-a-gaz" */
function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function num(form: FormData, key: string, fallback = 0): number {
  const v = Number(String(form.get(key) ?? "").replace(",", "."));
  return Number.isFinite(v) ? v : fallback;
}

function refresh() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------- catégories

export async function saveCategory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = str(formData, "id");
    const name = str(formData, "name");
    if (!name) return { error: "Le nom est obligatoire." };

    const data = {
      name,
      tagline: str(formData, "tagline"),
      slug: str(formData, "slug") || slugify(name),
      position: num(formData, "position"),
    };

    if (id) await prisma.category.update({ where: { id }, data });
    else await prisma.category.create({ data });

    refresh();
    return {};
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCategory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = str(formData, "id");
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return {
        error: `Cette catégorie contient ${count} produit(s). Déplacez-les ou supprimez-les d'abord.`,
      };
    }
    await prisma.category.delete({ where: { id } });
    refresh();
    return {};
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------ sous-catégories

export async function saveSubcategory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = str(formData, "id");
    const name = str(formData, "name");
    const categoryId = str(formData, "categoryId");
    if (!name || !categoryId) return { error: "Nom et catégorie sont obligatoires." };

    const data = {
      name,
      slug: str(formData, "slug") || slugify(name),
      position: num(formData, "position"),
      categoryId,
    };

    if (id) await prisma.subcategory.update({ where: { id }, data });
    else await prisma.subcategory.create({ data });

    refresh();
    return {};
  } catch (e) {
    return fail(e);
  }
}

export async function deleteSubcategory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    // Les produits ne sont pas supprimés : leur sous-catégorie passe à null.
    await prisma.subcategory.delete({ where: { id: str(formData, "id") } });
    refresh();
    return {};
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------ produits

export async function saveProduct(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  let slug: string;

  try {
    await requireAdmin();

    const id = str(formData, "id");
    const name = str(formData, "name");
    if (!name) return { error: "Le nom du produit est obligatoire." };

    const categoryId = str(formData, "categoryId");
    if (!categoryId) return { error: "La catégorie est obligatoire." };

    // Photos : on accepte plusieurs fichiers d'un coup. La première photo
    // envoyée devient la principale si aucune n'est déjà définie.
    const files = formData
      .getAll("imageFile")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length > 0 && !isR2Configured()) {
      return {
        error:
          "L'upload d'images n'est pas configuré (variables R2_*). Collez une URL d'image en attendant.",
      };
    }

    const uploaded: string[] = [];
    for (const f of files) uploaded.push(await uploadImage(f, "produits"));

    const imageUrl = str(formData, "imageUrl") || uploaded[0] || "";
    if (!imageUrl) return { error: "Une photo est obligatoire (upload ou URL)." };

    const subcategoryId = str(formData, "subcategoryId");
    const colors = str(formData, "colors");
    slug = str(formData, "slug") || slugify(name);

    const data = {
      name,
      slug,
      tagline: str(formData, "tagline"),
      description: str(formData, "description"),
      priceFCFA: Math.max(0, Math.round(num(formData, "priceFCFA"))),
      weightKg: Math.max(0, num(formData, "weightKg")),
      minOrderQty: Math.max(1, Math.round(num(formData, "minOrderQty", 1))),
      colors: colors || null,
      imageUrl,
      position: num(formData, "position"),
      inStock: formData.get("inStock") === "on",
      categoryId,
      subcategoryId: subcategoryId || null,
    };

    const saved = id
      ? await prisma.product.update({ where: { id }, data })
      : await prisma.product.create({ data: { ...data, afficheUrl: "" } });

    if (uploaded.length > 0) {
      const last = await prisma.productImage.findFirst({
        where: { productId: saved.id },
        orderBy: { position: "desc" },
      });
      await prisma.productImage.createMany({
        data: uploaded.map((url, i) => ({
          url,
          kind: "photo",
          position: (last?.position ?? -1) + 1 + i,
          productId: saved.id,
        })),
      });
    }

    refresh();
  } catch (e) {
    return fail(e);
  }

  // redirect() lève une exception interne à Next : elle doit rester hors du try.
  redirect("/admin/catalogue");
}

export async function deleteProduct(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = str(formData, "id");

    // Un produit déjà commandé est archivé plutôt que supprimé : l'effacer
    // casserait l'historique des commandes qui le référencent.
    const ordered = await prisma.orderItem.count({ where: { productId: id } });
    if (ordered > 0) {
      await prisma.product.update({ where: { id }, data: { inStock: false } });
      refresh();
      return {};
    }

    await prisma.product.delete({ where: { id } });
    refresh();
    return {};
  } catch (e) {
    return fail(e);
  }
}

export async function toggleStock(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const id = str(formData, "id");
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return { error: "Produit introuvable." };
    await prisma.product.update({ where: { id }, data: { inStock: !product.inStock } });
    refresh();
    return {};
  } catch (e) {
    return fail(e);
  }
}

/** Retire une photo de la galerie, et du stockage R2 si elle y est hébergée. */
export async function deleteProductImage(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const imageId = str(formData, "imageId");
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) return { error: "Photo introuvable." };

    const product = await prisma.product.findUnique({ where: { id: image.productId } });
    if (product?.imageUrl === image.url) {
      return {
        error: "C'est la photo principale. Choisissez-en une autre avant de la supprimer.",
      };
    }

    await prisma.productImage.delete({ where: { id: imageId } });
    await deleteImage(image.url);
    refresh();
    return {};
  } catch (e) {
    return fail(e);
  }
}

/** Promeut une photo de la galerie en photo principale du produit. */
export async function setMainImage(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const productId = str(formData, "productId");
    const url = str(formData, "url");
    if (!url) return { error: "Photo invalide." };
    await prisma.product.update({ where: { id: productId }, data: { imageUrl: url } });
    refresh();
    return {};
  } catch (e) {
    return fail(e);
  }
}
