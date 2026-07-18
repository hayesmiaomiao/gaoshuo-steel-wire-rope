import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import applicationsJson from "@/data/applications.json";
import categoriesJson from "@/data/categories.json";
import companyJson from "@/data/company.json";
import productsJson from "@/data/products.json";
import servicesJson from "@/data/services.json";
import { applicationSchema, categorySchema, companySchema, productSchema, serviceSchema } from "@/lib/validation/schemas";

const products = productSchema.array().parse(productsJson);
const categories = categorySchema.array().parse(categoriesJson);
const services = serviceSchema.array().parse(servicesJson);
const applications = applicationSchema.array().parse(applicationsJson);
const company = companySchema.parse(companyJson);

describe("rebuild data", () => {
  it("contains the requested product and route data", () => {
    expect(products).toHaveLength(26);
    expect(categories).toHaveLength(6);
    expect(services).toHaveLength(6);
    expect(applications).toHaveLength(7);
    expect(new Set(products.map((product) => product.sku)).size).toBe(26);
    expect(new Set(products.map((product) => product.slug)).size).toBe(26);
  });

  it("assigns every product to valid categories and applications", () => {
    const categorySlugs = new Set(categories.map((category) => category.slug));
    const applicationSlugs = new Set(applications.map((application) => application.slug));
    for (const product of products) {
      expect(categorySlugs.has(product.category)).toBe(true);
      expect(product.applications.every((application) => applicationSlugs.has(application))).toBe(true);
    }
  });

  it("references existing production images", () => {
    for (const product of products) {
      for (const image of [product.image, ...product.gallery]) {
        expect(fs.existsSync(path.join(process.cwd(), "public", image))).toBe(true);
      }
    }
  });

  it("does not expose unconfirmed or migrated source data", () => {
    const serialized = JSON.stringify({ products, categories, services, applications, company });
    expect(serialized).not.toMatch(/\bTBD\b/i);
    expect(serialized).not.toMatch(/justwirerope|wireropeassy/i);
    expect(company.email).toBe("");
    expect(company.phone).toBe("");
    expect(company.whatsapp).toBe("");
    expect(company.certifications).toEqual([]);
  });

  it("is fully JSON serializable for client component props", () => {
    const payload = { products, categories, services, applications, company };
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
  });
});
