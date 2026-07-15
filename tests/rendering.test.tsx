import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecificationTable } from "@/components/product/SpecificationTable";
import { enhanceProduct, type ProductRow } from "@/lib/products/schema";
import { getRelatedProducts } from "@/lib/products/data";

describe("rendering behavior", () => {
  it("does not render empty specification rows", () => {
    render(<SpecificationTable caption="Specs" rows={[{ label: "Material", value: "Steel" }, { label: "MOQ", value: "" }]} />);
    expect(screen.getByText("Material")).toBeDefined();
    expect(screen.queryByText("MOQ")).toBeNull();
  });

  it("returns related products while excluding the current product", () => {
    const row: ProductRow = {
      sku: "TEST",
      slug: "test-product",
      product_name: "Test Product",
      short_description: "Test description",
      category: "stainless-steel-wire-rope",
      construction: "7x7",
      diameter_min_mm: "",
      diameter_max_mm: "",
      material: "steel",
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
      applications: "marine",
      customization: "",
      standards: "",
      certifications: "",
      moq: "",
      lead_time: "",
      image: "/images/placeholders/wire-rope-placeholder.svg",
      gallery: "",
      datasheet: "",
      featured: "false",
      status: "published",
      seo_title: "Test Product",
      seo_description: "Test description",
      verification_status: "source-approved",
      publishable: "true",
      source_domain: "",
      source_url: "",
      migration_notes: "Test product.",
      product_type: "wire rope assembly",
      end_fitting: "eye loop",
      features: "custom length|terminal options"
    };
    const related = getRelatedProducts(enhanceProduct(row));
    expect(related.length).toBeGreaterThan(0);
    expect(related.some((product) => product.sku === "TEST")).toBe(false);
  });
});
