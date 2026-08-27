import { prisma } from "./db";

export function getCategories() {
  return prisma.category.findMany({
    orderBy: { position: "asc" },
    include: {
      subcategories: { orderBy: { position: "asc" } },
      products: { orderBy: { position: "asc" }, take: 1 },
      _count: { select: { products: true } },
    },
  });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      subcategories: { orderBy: { position: "asc" } },
      products: {
        orderBy: { position: "asc" },
        include: { subcategory: true, variants: { orderBy: { position: "asc" } } },
      },
    },
  });
}

export function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      subcategory: true,
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
      specs: { orderBy: { position: "asc" } },
    },
  });
}

export function getFeaturedProducts(take = 8) {
  return prisma.product.findMany({
    where: { inStock: true },
    orderBy: [{ categoryId: "asc" }, { position: "asc" }],
    take,
    include: { category: true, variants: { orderBy: { position: "asc" } } },
  });
}

export function getAllProductSlugs() {
  return prisma.product.findMany({ select: { slug: true } });
}

/** Tous les produits, éventuellement filtrés sur une catégorie. */
export function getAllProducts(categorySlug?: string) {
  return prisma.product.findMany({
    where: {
      inStock: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: [{ categoryId: "asc" }, { position: "asc" }],
    include: {
      category: true,
      subcategory: true,
      variants: { orderBy: { position: "asc" } },
    },
  });
}

export function searchProducts(q: string) {
  return prisma.product.findMany({
    where: {
      inStock: true,
      OR: [
        { name: { contains: q } },
        { tagline: { contains: q } },
        { description: { contains: q } },
      ],
    },
    orderBy: [{ categoryId: "asc" }, { position: "asc" }],
    include: { category: true, variants: { orderBy: { position: "asc" } } },
  });
}
