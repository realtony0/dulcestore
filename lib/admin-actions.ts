"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { isAuthenticated } from "./admin-auth";
import { uploadImage, isR2Configured } from "./r2";

/**
 * Écritures du back-office. Chaque action revérifie la session : une action
 * serveur est une route HTTP à part entière, la protection de la page ne suffit
 * pas à la sécuriser.
 *
 * Aucune action ne touche aux commandes.
 */

async function requireAdmin() {
  if (!(await isAuthenticated())) throw new Error("Non autorisé.");
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

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("Le nom est obligatoire.");

  const data = {
    name,
    tagline: str(formData, "tagline"),
    slug: str(formData, "slug") || slugify(name),
    position: num(formData, "position"),
  };

  if (id) await prisma.category.update({ where: { id }, data });
  else await prisma.category.create({ data });

  refresh();
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error(
      `Cette catégorie contient ${count} produit(s). Déplacez-les ou supprimez-les d'abord.`,
    );
  }
  await prisma.category.delete({ where: { id } });
  refresh();
}

// ------------------------------------------------------------ sous-catégories

export async function saveSubcategory(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const name = str(formData, "name");
  const categoryId = str(formData, "categoryId");
  if (!name || !categoryId) throw new Error("Nom et catégorie sont obligatoires.");

  const data = {
    name,
    slug: str(formData, "slug") || slugify(name),
    position: num(formData, "position"),
    categoryId,
  };

  if (id) await prisma.subcategory.update({ where: { id }, data });
  else await prisma.subcategory.create({ data });

  refresh();
}

export async function deleteSubcategory(formData: FormData) {
  await requireAdmin();
  // Les produits ne sont pas supprimés : leur sous-catégorie passe à null.
  await prisma.subcategory.delete({ where: { id: str(formData, "id") } });
  refresh();
}

// ------------------------------------------------------------------ produits

export async function saveProduct(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) throw new Error("Le nom du produit est obligatoire.");

  const categoryId = str(formData, "categoryId");
  if (!categoryId) throw new Error("La catégorie est obligatoire.");

  // Image : upload R2 si un fichier est fourni, sinon URL saisie, sinon on
  // conserve celle déjà enregistrée.
  let imageUrl = str(formData, "imageUrl");
  const file = formData.get("imageFile");
  if (file instanceof File && file.size > 0) {
    if (!isR2Configured()) {
      throw new Error(
        "L'upload d'images n'est pas configuré (variables R2_*). Collez une URL d'image en attendant.",
      );
    }
    imageUrl = await uploadImage(file, "produits");
  }
  if (!imageUrl) throw new Error("Une photo est obligatoire (upload ou URL).");

  const subcategoryId = str(formData, "subcategoryId");
  const colors = str(formData, "colors");

  const data = {
    name,
    slug: str(formData, "slug") || slugify(name),
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

  if (id) {
    await prisma.product.update({ where: { id }, data });
  } else {
    await prisma.product.create({ data: { ...data, afficheUrl: "" } });
  }

  refresh();
  redirect("/admin/catalogue");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");

  // Un produit déjà commandé est archivé plutôt que supprimé : l'effacer
  // casserait l'historique des commandes qui le référencent.
  const ordered = await prisma.orderItem.count({ where: { productId: id } });
  if (ordered > 0) {
    await prisma.product.update({ where: { id }, data: { inStock: false } });
    refresh();
    return;
  }

  await prisma.product.delete({ where: { id } });
  refresh();
}

export async function toggleStock(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.update({ where: { id }, data: { inStock: !product.inStock } });
  refresh();
}
