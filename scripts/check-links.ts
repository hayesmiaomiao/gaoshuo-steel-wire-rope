import fs from "node:fs";
import path from "node:path";
import { applications, capabilities, constructions, productCategories } from "../src/config/pages";
import { getPublishedProducts } from "../src/lib/products/data";
import { getPublishedResources } from "../src/lib/content/resources";
import { getPublishedServices } from "../src/lib/services/data";
import { normalizePath } from "../src/lib/utils/slug";

const knownPaths = new Set<string>([
  "/",
  "/products",
  "/applications",
  "/capabilities",
  "/manufacturing",
  "/quality-control",
  "/about",
  "/resources",
  "/services",
  "/resources/guides",
  "/resources/comparisons",
  "/resources/technical",
  "/contact",
  "/request-a-quote",
  "/thank-you",
  "/privacy-policy",
  "/robots.txt",
  "/sitemap.xml",
  ...productCategories.map((item) => `/products/${item.slug}`),
  ...applications.map((item) => `/applications/${item.slug}`),
  ...capabilities.map((item) => `/capabilities/${item.slug}`),
  ...constructions.map((item) => `/constructions/${item}`),
  ...getPublishedProducts().map((item) => `/products/${item.slug}`),
  ...getPublishedServices().map((item) => `/services/${item.slug}`),
  ...getPublishedResources().map((item) => `/resources/${item.slug}`)
]);

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(tsx|ts|md)$/.test(entry.name) ? [full] : [];
  });
}

const errors: string[] = [];
for (const file of [...walk(path.join(process.cwd(), "app")), ...walk(path.join(process.cwd(), "src"))]) {
  const text = fs.readFileSync(file, "utf8");
  const matches = text.matchAll(/href=["'`]([^"'`#?]+)["'`]/g);
  for (const match of matches) {
    const href = match[1];
    if (!href.startsWith("/") || href.startsWith("/images") || href.startsWith("/documents")) continue;
    const normalized = normalizePath(href);
    if (!knownPaths.has(normalized)) errors.push(`${path.relative(process.cwd(), file)} links to missing path: ${normalized}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Link checks passed.");
