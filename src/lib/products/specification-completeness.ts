import { getAllProducts } from "./data";
import {
  SPECIFICATION_DATA_FIELDS,
  getApplicableSpecificationFields,
  getMissingCriticalFields,
  getSpecificationPublishRisk,
  isConfirmedSpecificationValue,
  isNotApplicable,
  isTbd,
  type SpecificationRecord
} from "./specification-model";

export type SpecificationCompletenessRow = {
  sku: string;
  product_name: string;
  category: string;
  total_applicable_fields: string;
  confirmed_fields: string;
  tbd_fields: string;
  na_fields: string;
  completion_percentage: string;
  verification_status: string;
  missing_critical_fields: string;
  publish_risk: string;
  recommended_action: string;
};

export function createCompletenessRows(specifications: SpecificationRecord[]): SpecificationCompletenessRow[] {
  const products = getAllProducts().filter((product) => product.status === "published" && product.publishableBoolean);
  const specificationsBySku = new Map(specifications.map((record) => [record.sku, record]));
  return products.map((product) => {
    const record = specificationsBySku.get(product.sku);
    if (!record) {
      return {
        sku: product.sku,
        product_name: product.product_name,
        category: product.category,
        total_applicable_fields: "0",
        confirmed_fields: "0",
        tbd_fields: "0",
        na_fields: "0",
        completion_percentage: "0",
        verification_status: "missing",
        missing_critical_fields: "all",
        publish_risk: "critical",
        recommended_action: "Create and validate the missing specification row."
      };
    }

    const applicable = getApplicableSpecificationFields(product.category);
    const confirmed = applicable.filter((field) => isConfirmedSpecificationValue(record[field])).length;
    const tbd = SPECIFICATION_DATA_FIELDS.filter((field) => isTbd(record[field])).length;
    const notApplicable = SPECIFICATION_DATA_FIELDS.filter((field) => isNotApplicable(record[field])).length;
    const completion = applicable.length === 0 ? 0 : (confirmed / applicable.length) * 100;
    const missing = getMissingCriticalFields(record, product.category);
    const risk = getSpecificationPublishRisk(record, product.category);
    const recommendation = record.verification_status === "rejected"
      ? "Correct or replace the rejected source before using any specification."
      : missing.length > 0
        ? `Confirm critical fields: ${missing.join(", ")}.`
        : record.verification_status === "approved"
          ? "Maintain source documents and revalidate after future changes."
          : "Complete human review and approval before treating the data as final.";

    return {
      sku: product.sku,
      product_name: product.product_name,
      category: product.category,
      total_applicable_fields: String(applicable.length),
      confirmed_fields: String(confirmed),
      tbd_fields: String(tbd),
      na_fields: String(notApplicable),
      completion_percentage: completion.toFixed(1),
      verification_status: record.verification_status,
      missing_critical_fields: missing.join(";"),
      publish_risk: risk,
      recommended_action: recommendation
    };
  });
}
