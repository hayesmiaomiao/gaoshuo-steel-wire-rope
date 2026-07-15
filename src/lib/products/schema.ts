import { z } from "zod";
import { isValidSlug } from "@/lib/utils/slug";

export const productStatusSchema = z.enum(["draft", "reviewed", "published", "archived"]);
export const verificationStatusSchema = z.enum(["unverified", "needs-review", "source-approved", "reviewed", "rejected"]);

const optionalNumberString = z
  .string()
  .trim()
  .refine((value) => value === "" || /^-?\d+(\.\d+)?$/.test(value), "Must be a number string or empty");

export const productSchema = z.object({
  sku: z.string().trim(),
  slug: z.string().trim(),
  product_name: z.string().trim(),
  short_description: z.string().trim(),
  category: z.string().trim(),
  construction: z.string().trim(),
  diameter_min_mm: optionalNumberString,
  diameter_max_mm: optionalNumberString,
  material: z.string().trim(),
  grade: z.string().trim(),
  finish: z.string().trim(),
  core: z.string().trim(),
  coating: z.string().trim(),
  lay: z.string().trim(),
  tensile_grade: z.string().trim(),
  breaking_load: z.string().trim(),
  tolerance: z.string().trim(),
  length_options: z.string().trim(),
  packaging: z.string().trim(),
  applications: z.string().trim(),
  customization: z.string().trim(),
  standards: z.string().trim(),
  certifications: z.string().trim(),
  moq: z.string().trim(),
  lead_time: z.string().trim(),
  image: z.string().trim(),
  gallery: z.string().trim(),
  datasheet: z.string().trim(),
  featured: z.string().trim(),
  status: productStatusSchema,
  seo_title: z.string().trim(),
  seo_description: z.string().trim(),
  verification_status: verificationStatusSchema.optional().default("unverified"),
  publishable: z.string().trim().optional().default("false"),
  source_domain: z.string().trim().optional().default(""),
  source_url: z.string().trim().optional().default(""),
  migration_notes: z.string().trim().optional().default("")
  ,
  product_type: z.string().trim().optional().default(""),
  end_fitting: z.string().trim().optional().default(""),
  features: z.string().trim().optional().default("")
});

export type ProductRow = z.infer<typeof productSchema>;

export type Product = ProductRow & {
  featuredBoolean: boolean;
  applicationsList: string[];
  customizationList: string[];
  galleryList: string[];
  featuresList: string[];
  publishableBoolean: boolean;
};

export type ProductValidationResult = {
  products: Product[];
  errors: string[];
};

export function enhanceProduct(row: ProductRow): Product {
  return {
    ...row,
    featuredBoolean: row.featured.toLowerCase() === "true",
    publishableBoolean: row.publishable.toLowerCase() === "true",
    applicationsList: splitList(row.applications),
    customizationList: splitList(row.customization),
    galleryList: splitList(row.gallery),
    featuresList: splitList(row.features)
  };
}

export function splitList(value: string): string[] {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateProductBusinessRules(rows: Product[]): string[] {
  const errors: string[] = [];
  const seenSku = new Set<string>();
  const seenSlug = new Set<string>();

  for (const product of rows) {
    if (product.sku) {
      if (seenSku.has(product.sku)) errors.push(`Duplicate SKU: ${product.sku}`);
      seenSku.add(product.sku);
    }
    if (product.slug) {
      if (seenSlug.has(product.slug)) errors.push(`Duplicate slug: ${product.slug}`);
      seenSlug.add(product.slug);
      if (!isValidSlug(product.slug)) errors.push(`Invalid slug: ${product.slug}`);
    }

    if (product.status === "published") {
      if (!product.product_name) errors.push(`Published product missing name: ${product.sku}`);
      if (!product.slug) errors.push(`Published product missing slug: ${product.sku}`);
      if (!product.category) errors.push(`Published product missing category: ${product.sku}`);
      if (!product.image) errors.push(`Published product missing image: ${product.sku}`);
      if (!product.short_description) errors.push(`Published product missing description: ${product.sku}`);
      if (product.applicationsList.length === 0) errors.push(`Published product missing application: ${product.sku}`);
      if (product.customizationList.length === 0) errors.push(`Published product missing customization option: ${product.sku}`);
      if (!product.product_type) errors.push(`Published product missing product_type: ${product.sku}`);
      if (product.publishableBoolean !== true) errors.push(`Published product must be publishable=true: ${product.sku}`);
      if (product.verification_status !== "source-approved" && product.verification_status !== "reviewed") {
        errors.push(`Published product must be source-approved or reviewed: ${product.sku}`);
      }
    }

    if (
      product.product_name &&
      product.seo_title &&
      product.product_name.toLowerCase() !== product.seo_title.toLowerCase() &&
      !product.seo_title.toLowerCase().includes(product.product_name.toLowerCase())
    ) {
      errors.push(`SEO title may conflict with product name: ${product.sku}`);
    }
  }

  return errors;
}
