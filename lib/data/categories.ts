import "server-only";

import categoriesJson from "@/data/categories.json";
import { categorySchema, type Category } from "@/lib/validation/schemas";

const categories: Category[] = categorySchema.array().parse(categoriesJson);

export function getCategories(): Category[] {
  return categories;
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
