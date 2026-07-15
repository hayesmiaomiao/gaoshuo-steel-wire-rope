import { describe, expect, it } from "vitest";
import { enhanceProduct, validateProductBusinessRules, type ProductRow } from "@/lib/products/schema";
import { getPublishedProducts, readProducts } from "@/lib/products/data";

const baseRow: ProductRow = {
  sku: "PUBLISHED-1",
  slug: "published-wire-rope",
  product_name: "Published Wire Rope",
  short_description: "Verified description for testing.",
  category: "stainless-steel-wire-rope",
  construction: "7x7",
  diameter_min_mm: "1",
  diameter_max_mm: "2",
  material: "stainless steel",
  grade: "",
  finish: "",
  core: "",
  coating: "",
  lay: "",
  tensile_grade: "",
  breaking_load: "",
  tolerance: "",
  length_options: "",
  packaging: "",
  applications: "marine|architectural",
  customization: "cutting",
  standards: "",
  certifications: "",
  moq: "",
  lead_time: "",
  image: "/images/placeholders/wire-rope-placeholder.svg",
  gallery: "",
  datasheet: "",
  featured: "true",
  status: "published",
  seo_title: "Published Wire Rope",
  seo_description: "Published wire rope SEO description.",
  verification_status: "source-approved",
  publishable: "true",
  source_domain: "",
  source_url: "",
  migration_notes: "Test source-approved product.",
  product_type: "wire rope assembly",
  end_fitting: "eye loop",
  features: "custom length|terminal options"
};

describe("product data", () => {
  it("parses product CSV records", () => {
    const result = readProducts();
    expect(result.errors).toEqual([]);
    expect(result.products.length).toBeGreaterThan(0);
  });

  it("detects duplicate SKU", () => {
    const product = enhanceProduct(baseRow);
    expect(validateProductBusinessRules([product, product])).toContain("Duplicate SKU: PUBLISHED-1");
  });

  it("detects duplicate slug", () => {
    const first = enhanceProduct(baseRow);
    const second = enhanceProduct({ ...baseRow, sku: "PUBLISHED-2" });
    expect(validateProductBusinessRules([first, second])).toContain("Duplicate slug: published-wire-rope");
  });

  it("filters draft products from published products", () => {
    const published = getPublishedProducts();
    expect(published.length).toBeGreaterThan(0);
    expect(published.every((product) => product.status === "published")).toBe(true);
    expect(published.some((product) => product.sku.startsWith("GS-DRAFT"))).toBe(false);
  });

  it("validates a publishable product page source", () => {
    const product = enhanceProduct(baseRow);
    expect(validateProductBusinessRules([product])).toEqual([]);
    expect(product.slug).toBe("published-wire-rope");
  });
});
