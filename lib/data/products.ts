import "server-only";

import productsJson from "@/data/products.json";
import { productSchema, type Product } from "@/lib/validation/schemas";

const products: Product[] = productSchema.array().parse(productsJson);

export function getProducts(): Product[] {
  return products;
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (candidate) => candidate.slug !== product.slug && candidate.category === product.category
  );
  const otherProducts = products.filter(
    (candidate) => candidate.slug !== product.slug && candidate.category !== product.category
  );
  return [...sameCategory, ...otherProducts].slice(0, limit);
}
