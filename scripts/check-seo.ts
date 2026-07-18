import { applications, capabilities, constructions, productCategories } from "../src/config/pages";
import { getAllProducts, getPublishedProducts } from "../src/lib/products/data";
import { getPublishedResources, readResources } from "../src/lib/content/resources";
import { getPublishedServices } from "../src/lib/services/data";
import { isValidSlug } from "../src/lib/utils/slug";

const errors: string[] = [];
const titles = new Set<string>();
const descriptions = new Set<string>();

function addMeta(title: string, description: string, path: string) {
  if (titles.has(title)) errors.push(`Duplicate title: ${title} (${path})`);
  if (descriptions.has(description)) errors.push(`Duplicate description: ${description} (${path})`);
  titles.add(title);
  descriptions.add(description);
  if (!title) errors.push(`Missing title: ${path}`);
  if (!description) errors.push(`Missing description: ${path}`);
}

[
  ["/", "Custom Steel Wire Rope and Wire Rope Assemblies", "Steel wire rope solutions for industrial equipment, marine, lifting, architectural and custom assembly applications."],
  ["/products", "Steel Wire Rope Products", "Browse published steel wire rope products and category frameworks for verified B2B procurement."],
  ["/applications", "Steel Wire Rope Applications", "Application-based wire rope sourcing pages for industrial B2B procurement."],
  ["/capabilities", "Wire Rope Custom Capabilities", "Custom wire rope assembly, cutting, swaging, terminal installation and packaging capability framework."],
  ["/manufacturing", "Manufacturing Framework", "Manufacturing capability framework for Gaoshuo Steel Wire Rope with unverified claims intentionally excluded."],
  ["/quality-control", "Quality Control", "Quality control workflow framework for steel wire rope procurement and verified inspection documentation."],
  ["/about", "About Zhongshan Gaoshuo", "Learn about Zhongshan Gaoshuo Technology Co., Ltd., its business scope and custom wire rope, control cable and cable assembly solutions."],
  ["/resources", "Steel Wire Rope Resources", "Technical guides, comparisons and resources for steel wire rope procurement."],
  ["/services", "Wire Rope Assembly Services", "Source-approved service migration framework for custom wire rope assemblies, cable cutting, swaging, terminal installation and packaging."],
  ["/contact", "Contact", "Contact Gaoshuo Steel Wire Rope for steel wire rope and assembly inquiries."],
  ["/request-a-quote", "Request a Quote", "Request a steel wire rope or custom wire rope assembly quotation."],
  ["/privacy-policy", "Privacy Policy", "Privacy policy for Gaoshuo Steel Wire Rope inquiry website."]
].forEach(([path, title, description]) => addMeta(title, description, path));

for (const category of productCategories) addMeta(category.title, category.description, `/products/${category.slug}`);
for (const application of applications) addMeta(`${application.title} Wire Rope Applications`, application.description, `/applications/${application.slug}`);
for (const capability of capabilities) addMeta(capability.title, capability.description, `/capabilities/${capability.slug}`);
for (const construction of constructions) addMeta(`${construction} Wire Rope Construction`, `Published ${construction} wire rope products and procurement inquiry framework.`, `/constructions/${construction}`);

for (const product of getAllProducts()) {
  if (product.slug && !isValidSlug(product.slug)) errors.push(`Invalid product slug: ${product.slug}`);
  if (product.status === "published") {
    addMeta(product.seo_title || product.product_name, product.seo_description || product.short_description, `/products/${product.slug}`);
    if (!product.product_name || !product.short_description || !product.image) errors.push(`Published product missing basic content: ${product.sku}`);
  }
  if (product.status === "draft" && getPublishedProducts().some((item) => item.sku === product.sku)) errors.push(`Draft product exposed: ${product.sku}`);
  if (product.status === "archived") errors.push(`Archived product must remain non-indexable: ${product.sku}`);
}

const { resources, errors: resourceErrors } = readResources();
errors.push(...resourceErrors);
for (const resource of resources) {
  if (!isValidSlug(resource.slug)) errors.push(`Invalid resource slug: ${resource.slug}`);
  if (resource.status !== "published" && !resource.noindex) errors.push(`Non-published resource not noindex: ${resource.slug}`);
}
for (const resource of getPublishedResources()) addMeta(resource.title, resource.description, `/resources/${resource.slug}`);
for (const service of getPublishedServices()) addMeta(`${service.service_name} Service`, service.short_description, `/services/${service.slug}`);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("SEO checks passed.");
