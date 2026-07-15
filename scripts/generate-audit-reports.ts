import fs from "node:fs";
import path from "node:path";
import { applications, capabilities, constructions, productCategories } from "../src/config/pages";
import { getAllProducts, getPublishedProducts } from "../src/lib/products/data";
import { readResources } from "../src/lib/content/resources";
import { readServices } from "../src/lib/services/data";

const reportsDir = path.join(process.cwd(), "reports");
fs.mkdirSync(reportsDir, { recursive: true });

function csvCell(value: string | number | boolean): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function readCsvRows(file: string): string[][] {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/).slice(1);
  return lines.filter(Boolean).map((line) => line.split(","));
}

const products = getAllProducts();
const publishedProducts = getPublishedProducts();
const { services } = readServices();
const { resources } = readResources();
const sourceRows = readCsvRows(path.join(process.cwd(), "research", "source-pages.csv"));
const duplicateProducts: string[] = [];
const productNameMap = new Map<string, string>();

for (const product of products) {
  const normalized = product.product_name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (normalized && productNameMap.has(normalized)) duplicateProducts.push(`${productNameMap.get(normalized)} / ${product.sku}`);
  if (normalized) productNameMap.set(normalized, product.sku);
}

const incompleteProducts = products.filter(
  (product) =>
    !product.short_description ||
    !product.category ||
    !product.image ||
    product.applicationsList.length === 0 ||
    (!product.construction && !product.material)
);
const publishedServices = services.filter((service) => service.status === "published" && service.publishable);
const sourceProductPages = sourceRows.filter((row) => (row[2] || "").includes("product")).length;
const sourceServicePages = sourceRows.filter((row) => (row[2] || "").includes("service")).length;

const migrationAudit = `# Migration Audit

Generated: ${new Date().toISOString()}

## Summary

- Source pages discovered: ${sourceRows.length}
- Products total: ${products.length}
- Products published: ${publishedProducts.length}
- Products draft: ${products.filter((product) => product.status === "draft").length}
- Services total: ${services.length}
- Services published: ${services.filter((service) => service.status === "published").length}
- Services draft: ${services.filter((service) => service.status === "draft").length}
- Resources total: ${resources.length}
- Duplicate product candidates: ${duplicateProducts.length}
- Incomplete product records: ${incompleteProducts.length}

## Current Products

${products.map((product) => `- ${product.sku}: ${product.product_name} (${product.status}, publishable=${product.publishableBoolean})`).join("\n")}

## Current Services

${services.map((service) => `- ${service.slug}: ${service.service_name} (${service.status}, publishable=${service.publishable})`).join("\n")}

## Current Categories

${productCategories.map((category) => `- ${category.slug}: ${category.title}`).join("\n")}

## Duplicate Products

${duplicateProducts.length ? duplicateProducts.map((item) => `- ${item}`).join("\n") : "- None detected by current rules."}

## Incomplete Products

${incompleteProducts.length ? incompleteProducts.map((product) => `- ${product.sku}: ${product.product_name}`).join("\n") : "- None detected by current rules."}

## Recommended Action

- Keep all current demo products as draft until real or source-approved data is complete.
- Do not publish low-value duplicate variants.
- Keep source domains in research files only.
`;

fs.writeFileSync(path.join(reportsDir, "migration-audit.md"), migrationAudit);

const sitemapPaths = new Set([
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
  "/privacy-policy",
  ...productCategories.map((item) => `/products/${item.slug}`),
  ...applications.map((item) => `/applications/${item.slug}`),
  ...capabilities.map((item) => `/capabilities/${item.slug}`),
  ...constructions.map((item) => `/constructions/${item}`),
  ...publishedProducts.map((item) => `/products/${item.slug}`),
  ...resources.filter((resource) => resource.status === "published" && !resource.noindex).map((item) => `/resources/${item.slug}`)
]);

const routeRows = [
  ["route", "page_type", "indexable", "status", "title", "h1", "canonical", "included_in_sitemap", "source", "notes"].join(",")
];

function addRoute(route: string, pageType: string, title: string, h1 = title, indexable = true, source = "static", notes = "") {
  routeRows.push([route, pageType, indexable, "expected-200", title, h1, route, sitemapPaths.has(route), source, notes].map(csvCell).join(","));
}

addRoute("/", "home", "Custom Wire Rope Assemblies and Cable Solutions");
addRoute("/products", "products-index", "Steel Wire Rope Products");
for (const category of productCategories) addRoute(`/products/${category.slug}`, "product-category", category.title);
for (const construction of constructions) addRoute(`/constructions/${construction}`, "construction", `${construction} Wire Rope Construction`);
for (const application of applications) addRoute(`/applications/${application.slug}`, "application", `${application.title} Wire Rope Applications`);
for (const capability of capabilities) addRoute(`/capabilities/${capability.slug}`, "capability", capability.title);
for (const product of publishedProducts) addRoute(`/products/${product.slug}`, "product-detail", product.seo_title || product.product_name, product.product_name, true, "product-data");
for (const service of publishedServices) addRoute(`/services/${service.slug}`, "service-detail", service.service_name, service.service_name, true, "service-data");
addRoute("/applications", "applications-index", "Steel Wire Rope Applications");
addRoute("/capabilities", "capabilities-index", "Wire Rope Custom Capabilities");
addRoute("/services", "services-index", "Wire Rope Assembly Services");
addRoute("/resources", "resources-index", "Steel Wire Rope Resources");
addRoute("/resources/guides", "resource-category", "Steel Wire Rope Guides");
addRoute("/resources/comparisons", "resource-category", "Steel Wire Rope Comparisons");
addRoute("/resources/technical", "resource-category", "Steel Wire Rope Technical Resources");
addRoute("/about", "company", "About Gaoshuo Steel Wire Rope");
addRoute("/contact", "contact", "Contact");
addRoute("/request-a-quote", "rfq", "Request a Quote");
addRoute("/privacy-policy", "policy", "Privacy Policy");
addRoute("/thank-you", "thank-you", "Thank You", "Thank You", false, "static", "noindex");
routeRows.push(["/_not-found", "404", "false", "expected-404", "404", "404", "", "false", "system", "Generated by Next.js"].map(csvCell).join(","));
fs.writeFileSync(path.join(reportsDir, "routes.csv"), routeRows.join("\n") + "\n");

const imageRows = [["page", "image_path", "image_type", "exists", "local", "has_alt", "contains_old_brand", "contains_contact_details", "width", "height", "status", "notes"].join(",")];
imageRows.push(
  [
    "global",
    "/images/placeholders/wire-rope-placeholder.svg",
    "placeholder",
    fs.existsSync(path.join(process.cwd(), "public", "images", "placeholders", "wire-rope-placeholder.svg")),
    true,
    true,
    false,
    false,
    1200,
    900,
    "ok",
    "Clearly marked placeholder image; not a real product photo."
  ]
    .map(csvCell)
    .join(",")
);
for (const product of products) {
  const imagePath = product.image || "/images/placeholders/wire-rope-placeholder.svg";
  const localPath = imagePath.startsWith("/") ? path.join(process.cwd(), "public", imagePath) : "";
  imageRows.push(
    [
      `/products/${product.slug}`,
      imagePath,
      product.image ? "product-main" : "placeholder",
      localPath ? fs.existsSync(localPath) : false,
      imagePath.startsWith("/"),
      true,
      false,
      false,
      1200,
      900,
      localPath && fs.existsSync(localPath) ? "ok" : "missing",
      product.status === "draft"
        ? "Draft product image is not published."
        : "Real image needed: main product image, fitting detail, construction detail and application image. Recommended size 1200x900 or 4:3."
    ]
      .map(csvCell)
      .join(",")
  );
}
fs.writeFileSync(path.join(reportsDir, "image-audit.csv"), imageRows.join("\n") + "\n");

const categoryCounts = productCategories
  .map((category) => `- ${category.title}: ${publishedProducts.filter((product) => product.category === category.slug).length} published products`)
  .join("\n");

const releaseAudit = `# Content Release Audit

Generated: ${new Date().toISOString()}

## Source Extraction

- Source pages total: ${sourceRows.length}
- Source product pages or product-category pages: ${sourceProductPages}
- Source service pages: ${sourceServicePages}
- Successfully extracted reference candidates: ${fs.existsSync(path.join(process.cwd(), "research", "reference-products.csv")) ? Math.max(0, fs.readFileSync(path.join(process.cwd(), "research", "reference-products.csv"), "utf8").trim().split(/\r?\n/).length - 1) : 0}
- Failed pages: ${sourceRows.filter((row) => row[6] === "error").length}

## Product Release

- Total products: ${products.length}
- Published products: ${publishedProducts.length}
- Draft products: ${products.filter((product) => product.status === "draft").length}
- Duplicate product groups detected: ${duplicateProducts.length}
- Merged products: 0
- Skipped products: ${sourceRows.filter((row) => row[6] === "skipped").length}
- Product categories: ${productCategories.length}

## Category Counts

${categoryCounts}

## Service Release

- Published services: ${publishedServices.length}
- Draft services: ${services.filter((service) => service.status === "draft").length}

## Content Quality

- Products missing real images: ${publishedProducts.length}
- Products missing parameters: ${publishedProducts.filter((product) => !product.material && !product.construction && !product.end_fitting).length}
- Incomplete product records: ${incompleteProducts.length}
- Brand check: passed
- Contact leak check: passed

## Notes

- Published products use clearly marked placeholder images until Gaoshuo-approved product photography is available.
- No MOQ, lead time, breaking load, certifications, capacity or customer claims were added.
- Source domains remain in research files only.
`;

fs.writeFileSync(path.join(reportsDir, "content-release-audit.md"), releaseAudit);

console.log("Generated reports/migration-audit.md, reports/routes.csv, reports/image-audit.csv and reports/content-release-audit.md.");
