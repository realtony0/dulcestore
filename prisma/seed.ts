import { PrismaClient } from "@prisma/client";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { CATALOG } from "../lib/catalog-data";

const prisma = new PrismaClient();

/**
 * Les images sont rangées par produit dans public/produits/<slug>/ :
 *   affiche.jpeg  — le visuel Dulce Store (nom, prix, arguments)
 *   photo-N.jpeg  — visuels produit
 *   fiche-N.jpeg  — fiches techniques fournisseur
 * Ajouter un fichier au bon nom suffit : il est repris au prochain seed.
 */
function readImages(slug: string) {
  const dir = join(process.cwd(), "public", "produits", slug);
  if (!existsSync(dir)) {
    console.warn(`  ⚠ aucun dossier d'images pour "${slug}"`);
    return { affiche: null as string | null, images: [] as { url: string; kind: string; position: number }[] };
  }
  const files = readdirSync(dir).sort();
  const affiche = files.find((f) => f.startsWith("affiche"));
  const images = files
    .filter((f) => f.startsWith("photo-") || f.startsWith("fiche-"))
    .map((f, i) => ({
      url: `/produits/${slug}/${f}`,
      kind: f.startsWith("photo-") ? "photo" : "fiche",
      position: i,
    }));
  return { affiche: affiche ? `/produits/${slug}/${affiche}` : null, images };
}

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();

  for (const [catIndex, cat] of CATALOG.entries()) {
    const category = await prisma.category.create({
      data: { slug: cat.slug, name: cat.name, tagline: cat.tagline, position: catIndex },
    });

    const subIds = new Map<string, string>();
    for (const [subIndex, sub] of cat.subcategories.entries()) {
      const created = await prisma.subcategory.create({
        data: { slug: sub.slug, name: sub.name, position: subIndex, categoryId: category.id },
      });
      subIds.set(sub.slug, created.id);
    }

    for (const [prodIndex, p] of cat.products.entries()) {
      const subcategoryId = subIds.get(p.subcategory);
      if (!subcategoryId) throw new Error(`Sous-catégorie inconnue "${p.subcategory}" pour ${p.slug}`);

      const { affiche, images } = readImages(p.slug);
      const cleanPhoto = images.find((i) => i.kind === "photo")?.url;
      const cleanFiche = images.find((i) => i.kind === "fiche")?.url;
      const imageUrl = cleanPhoto ?? cleanFiche ?? affiche ?? "";

      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          description: p.description,
          priceFCFA: p.priceFCFA,
          weightKg: p.weightKg,
          minOrderQty: p.minOrderQty ?? 1,
          colors: p.colors?.join(", ") ?? null,
          imageUrl,
          afficheUrl: affiche ?? "",
          position: prodIndex,
          categoryId: category.id,
          subcategoryId,
          images: { create: images },
          variants: {
            create: (p.variants ?? []).map((v, i) => ({
              name: v.name,
              priceFCFA: v.priceFCFA,
              weightKg: v.weightKg,
              position: i,
            })),
          },
          specs: {
            create: (p.specs ?? []).map((s, i) => ({ label: s.label, value: s.value, position: i })),
          },
        },
      });
    }

    console.log(`✓ ${cat.name} — ${cat.products.length} produit(s)`);
  }

  const total = CATALOG.reduce((n, c) => n + c.products.length, 0);
  console.log(`\n${total} produits enregistrés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
