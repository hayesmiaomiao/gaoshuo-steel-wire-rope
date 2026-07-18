import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TechnicalSpecificationTable } from "@/components/product/TechnicalSpecificationTable";
import { getPublishedProducts } from "@/lib/products/data";
import { createCompletenessRows } from "@/lib/products/specification-completeness";
import { SPECIFICATION_DATA_FIELDS, createSpecificationTemplate, isConfirmedSpecificationValue } from "@/lib/products/specification-model";
import { readProductSpecifications } from "@/lib/products/specifications";
import { readProductSourceMappings, readProductSpecificationSources } from "@/lib/products/specification-sources";
import { productSchema as createProductSchema } from "@/lib/seo/schema";

describe("product specifications", () => {
  it("matches all published and publishable product identities", () => {
    const products = getPublishedProducts().filter((product) => product.publishableBoolean);
    const result = readProductSpecifications();
    expect(result.errors).toEqual([]);
    expect(result.specifications).toHaveLength(26);
    expect(result.specifications.map((record) => [record.sku, record.product_slug, record.product_name])).toEqual(
      products.map((product) => [product.sku, product.slug, product.product_name])
    );
    expect(result.specifications.filter((record) => record.verification_status === "incomplete")).toHaveLength(18);
    expect(result.specifications.filter((record) => record.verification_status === "unverified")).toHaveLength(8);
    expect(result.specifications.some((record) => ["reviewed", "approved"].includes(record.verification_status))).toBe(false);
  });

  it("reports conservative partial completeness after source extraction", () => {
    const rows = createCompletenessRows(readProductSpecifications().specifications);
    expect(rows).toHaveLength(26);
    expect(rows.some((row) => Number(row.completion_percentage) > 0)).toBe(true);
    expect(rows.filter((row) => row.verification_status === "unverified").every((row) => row.completion_percentage === "0.0")).toBe(true);
  });

  it("traces every confirmed formal field to an accepted product-level source", () => {
    const specifications = readProductSpecifications().specifications;
    const sources = readProductSpecificationSources();
    const mappings = readProductSourceMappings();
    expect(sources.errors).toEqual([]);
    expect(mappings.errors).toEqual([]);
    expect(mappings.records).toHaveLength(26);

    for (const specification of specifications) {
      for (const field of SPECIFICATION_DATA_FIELDS) {
        if (!isConfirmedSpecificationValue(specification[field])) continue;
        expect(sources.records.some((source) =>
          source.sku === specification.sku &&
          source.field_name === field &&
          source.normalized_value === specification[field] &&
          source.use_status === "accepted" &&
          ["product-page", "drawing", "datasheet"].includes(source.source_type)
        )).toBe(true);
      }
    }
  });

  it("does not add unverified or placeholder values to Product Schema", () => {
    const product = getPublishedProducts()[0];
    const specification = readProductSpecifications().specifications.find((record) => record.sku === product.sku);
    const schema = createProductSchema(product, specification);
    const serialized = JSON.stringify(schema);
    expect(serialized).not.toContain("TBD");
    expect(serialized).not.toContain("N/A");
    expect(schema.additionalProperty).toBeUndefined();
    expect(schema.material).toBeUndefined();
  });

  it("does not add incomplete source-backed values to Product Schema", () => {
    const product = getPublishedProducts().find((item) => item.sku === "GS-WRA-001");
    const specification = readProductSpecifications().specifications.find((record) => record.sku === "GS-WRA-001");
    expect(product).toBeDefined();
    expect(specification?.verification_status).toBe("incomplete");
    const schema = createProductSchema(product!, specification);
    expect(schema.material).toBeUndefined();
    expect(schema.additionalProperty).toBeUndefined();
  });

  it("hides the full table for unverified specifications", () => {
    const product = getPublishedProducts()[0];
    const specification = createSpecificationTemplate(product);
    render(<TechnicalSpecificationTable category={product.category} specification={specification} />);
    expect(screen.getByText("Detailed specifications are being verified. Please submit your drawing or application requirements for confirmation.")).toBeDefined();
    expect(screen.queryByText("Wire Rope")).toBeNull();
  });

  it("shows only confirmed values for incomplete specifications", () => {
    const product = getPublishedProducts()[0];
    const specification = createSpecificationTemplate(product);
    specification.verification_status = "incomplete";
    specification.material = "Verified Demo Material";
    render(<TechnicalSpecificationTable category={product.category} specification={specification} />);
    expect(screen.getByText("Verified Demo Material")).toBeDefined();
    expect(screen.queryByText("TBD")).toBeNull();
  });

  it("marks accepted approximate fields without exposing source links", () => {
    const product = getPublishedProducts()[0];
    const specification = createSpecificationTemplate(product);
    specification.verification_status = "incomplete";
    specification.material = "Reference Material";
    render(<TechnicalSpecificationTable category={product.category} specification={specification} approximateFields={["material"]} />);
    expect(screen.getByText(/Approximate reference value — final specification subject to confirmation/)).toBeDefined();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
