import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import { parseCsvRecords } from "@/lib/csv";
import { SPECIFICATION_DATA_FIELDS, isConfirmedSpecificationValue } from "@/lib/products/specification-model";
import { readProductSpecifications } from "@/lib/products/specifications";

const reviewPath = path.join(process.cwd(), "reports", "product-specification-source-review.html");

describe("product specification source review", () => {
  it("renders all products and supports the required read-only filters", () => {
    const html = fs.readFileSync(reviewPath, "utf8");
    const dom = new JSDOM(html, { runScripts: "dangerously", url: "https://local-review.invalid/" });
    const document = dom.window.document;

    expect(document.querySelectorAll("article.card")).toHaveLength(26);
    expect(document.querySelector("#summary")?.textContent).toContain("26 / 26");
    expect(document.querySelectorAll("select")).toHaveLength(3);
    expect(document.querySelectorAll("input, textarea, [contenteditable='true']")).toHaveLength(0);
    expect(document.body.textContent).toContain("company-capability-only");
    expect(document.body.textContent).toContain("manual review required");
    expect(document.body.textContent).toContain("内部候选填充（不用于前台）");
    expect(document.body.textContent).toContain("candidate-only");

    const category = document.querySelector<HTMLSelectElement>("#category");
    expect(category).not.toBeNull();
    category!.value = "wire-rope-assemblies";
    category!.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    expect(document.querySelectorAll("article.card")).toHaveLength(6);
    expect(document.querySelector("#summary")?.textContent).toContain("6 / 26");

    category!.value = "";
    category!.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    const confidence = document.querySelector<HTMLSelectElement>("#confidence");
    confidence!.value = "low";
    confidence!.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    expect(document.querySelectorAll("article.card")).toHaveLength(8);
  });

  it("keeps the candidate fill separate from formal specifications", () => {
    const candidatePath = path.join(process.cwd(), "reports", "product-specification-candidate-fill.csv");
    const optionPath = path.join(process.cwd(), "reports", "product-specification-candidate-options.csv");
    const candidates = parseCsvRecords(fs.readFileSync(candidatePath, "utf8"));
    const options = parseCsvRecords(fs.readFileSync(optionPath, "utf8"));
    const formal = readProductSpecifications().specifications;
    const formalBySku = new Map(formal.map((record) => [record.sku, record]));

    expect(candidates.records).toHaveLength(26);
    expect(options.records.length).toBeGreaterThan(700);
    expect(SPECIFICATION_DATA_FIELDS.every((field) => candidates.headers.includes(field))).toBe(true);
    expect(candidates.records.every((record) => record.internal_status === "manual-review-only")).toBe(true);
    expect(options.records.some((record) => record.candidate_basis === "conflict-options" && record.candidate_value.startsWith("CONFLICT:"))).toBe(true);
    expect(options.records.some((record) => record.candidate_basis === "ambiguous-candidate" && record.candidate_value.startsWith("CANDIDATE:"))).toBe(true);

    for (const candidate of candidates.records) {
      const formalRecord = formalBySku.get(candidate.sku);
      expect(formalRecord).toBeDefined();
      for (const field of SPECIFICATION_DATA_FIELDS) {
        if (!isConfirmedSpecificationValue(formalRecord?.[field])) continue;
        expect(candidate[field]).toBe(formalRecord?.[field]);
      }
    }

    const productPageSource = fs.readFileSync(path.join(process.cwd(), "app", "products", "[slug]", "page.tsx"), "utf8");
    expect(productPageSource).not.toContain("product-specification-candidate-fill");
    expect(productPageSource).not.toContain("product-specification-candidate-options");
  });
});
