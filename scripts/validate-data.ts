import fs from "node:fs";
import path from "node:path";
import applicationsJson from "@/data/applications.json";
import categoriesJson from "@/data/categories.json";
import companyJson from "@/data/company.json";
import productsJson from "@/data/products.json";
import servicesJson from "@/data/services.json";
import { applicationSchema, categorySchema, companySchema, productSchema, serviceSchema } from "@/lib/validation/schemas";

const root = process.cwd();
const products = productSchema.array().parse(productsJson);
const categories = categorySchema.array().parse(categoriesJson);
const services = serviceSchema.array().parse(servicesJson);
const applications = applicationSchema.array().parse(applicationsJson);
const company = companySchema.parse(companyJson);
const errors: string[] = [];

function requireCount(label: string, actual: number, expected: number) {
  if (actual !== expected) errors.push(`${label}: expected ${expected}, received ${actual}`);
}

function duplicateValues(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

requireCount("products", products.length, 26);
requireCount("categories", categories.length, 6);
requireCount("services", services.length, 6);
requireCount("applications", applications.length, 7);

for (const duplicate of duplicateValues(products.map((product) => product.sku))) errors.push(`Duplicate SKU: ${duplicate}`);
for (const duplicate of duplicateValues(products.map((product) => product.slug))) errors.push(`Duplicate product slug: ${duplicate}`);

const categorySlugs = new Set(categories.map((category) => category.slug));
const applicationSlugs = new Set(applications.map((application) => application.slug));

for (const product of products) {
  if (!categorySlugs.has(product.category)) errors.push(`Unknown category for ${product.slug}: ${product.category}`);
  for (const application of product.applications) {
    if (!applicationSlugs.has(application)) errors.push(`Unknown application for ${product.slug}: ${application}`);
  }
  for (const image of [product.image, ...product.gallery]) {
    if (!fs.existsSync(path.join(root, "public", image))) errors.push(`Missing image for ${product.slug}: ${image}`);
  }
}

const serialized = JSON.stringify({ products, categories, services, applications, company });
if (/\bTBD\b/i.test(serialized)) errors.push("Data contains TBD.");
if (/justwirerope|wireropeassy/i.test(serialized)) errors.push("Data contains an old brand or source domain.");
if (company.email || company.phone || company.whatsapp) errors.push("Unconfirmed company contact fields must remain empty.");
if (company.certifications.length > 0) errors.push("Unconfirmed certifications must remain empty.");
JSON.parse(serialized);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const galleryImages = products.reduce((count, product) => count + product.gallery.length, 0);
console.log(`Validated ${products.length} products, ${galleryImages} gallery images, ${categories.length} categories, ${services.length} services and ${applications.length} applications.`);
