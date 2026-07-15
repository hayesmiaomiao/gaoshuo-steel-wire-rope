import { getAllProducts } from "../src/lib/products/data";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(steel|wire|rope|cable|with|for|custom)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter(Boolean));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

const products = getAllProducts();
const errors: string[] = [];
const slugs = new Map<string, string>();
const names = new Map<string, string>();

for (const product of products) {
  if (slugs.has(product.slug)) errors.push(`Duplicate slug ${product.slug}: ${slugs.get(product.slug)} and ${product.sku}`);
  slugs.set(product.slug, product.sku);

  const normalizedName = normalize(product.product_name);
  if (normalizedName && names.has(normalizedName)) errors.push(`Duplicate product name ${product.product_name}: ${names.get(normalizedName)} and ${product.sku}`);
  if (normalizedName) names.set(normalizedName, product.sku);
}

for (let i = 0; i < products.length; i += 1) {
  for (let j = i + 1; j < products.length; j += 1) {
    const first = products[i];
    const second = products[j];
    const nameSimilarity = jaccard(tokenSet(first.product_name), tokenSet(second.product_name));
    const sameCore =
      first.construction &&
      second.construction &&
      first.construction === second.construction &&
      first.material &&
      second.material &&
      first.material === second.material &&
      first.category === second.category &&
      first.end_fitting === second.end_fitting &&
      first.product_type === second.product_type;
    if (nameSimilarity >= 0.9 || sameCore) {
      errors.push(`Potential duplicate products: ${first.sku} and ${second.sku}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Duplicate product checks passed.");
