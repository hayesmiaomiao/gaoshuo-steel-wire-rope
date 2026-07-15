import fs from "node:fs";
import path from "node:path";
import { enhanceProduct, productSchema, validateProductBusinessRules, type Product, type ProductValidationResult } from "./schema";

const productFile = path.join(process.cwd(), "data", "products.csv");

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current);
  return cells;
}

export function readProducts(): ProductValidationResult {
  const csv = fs.readFileSync(productFile, "utf8").replace(/^\uFEFF/, "");
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headers = parseCsvLine(lines[0] ?? "");
  const products: Product[] = [];
  const errors: string[] = [];

  for (const [lineIndex, line] of lines.slice(1).entries()) {
    const values = parseCsvLine(line);
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    const parsed = productSchema.safeParse(record);
    if (!parsed.success) {
      errors.push(`Line ${lineIndex + 2}: ${parsed.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`).join("; ")}`);
      continue;
    }
    products.push(enhanceProduct(parsed.data));
  }

  errors.push(...validateProductBusinessRules(products));
  return { products, errors };
}

export function getAllProducts(): Product[] {
  return readProducts().products;
}

export function getPublishedProducts(): Product[] {
  return getAllProducts().filter((product) => product.status === "published");
}

export function getProductBySlug(slug: string): Product | undefined {
  return getPublishedProducts().find((product) => product.slug === slug);
}

export function getRelatedProducts(current: Product, limit = 4): Product[] {
  const scored = getPublishedProducts()
    .filter((product) => product.sku !== current.sku)
    .map((product) => {
      let score = 0;
      if (product.category && product.category === current.category) score += 4;
      if (product.construction && product.construction === current.construction) score += 3;
      if (product.material && product.material === current.material) score += 2;
      if (product.applicationsList.some((app) => current.applicationsList.includes(app))) score += 1;
      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.product);
}

export function getProductsByCategory(category: string): Product[] {
  return getPublishedProducts().filter((product) => product.category === category);
}

export function getProductsByConstruction(construction: string): Product[] {
  return getPublishedProducts().filter((product) => product.construction === construction);
}
