import fs from "node:fs";
import path from "node:path";
import { parseCsvRecords } from "@/lib/csv";
import { SPECIFICATION_HEADERS, type SpecificationField } from "./specification-model";

export const PRODUCT_SOURCE_MAPPING_HEADERS = [
  "sku",
  "product_slug",
  "product_name",
  "category",
  "source_url",
  "secondary_source_url",
  "source_product_name",
  "match_type",
  "match_confidence",
  "match_reason",
  "parameter_conflict",
  "review_status",
  "notes"
] as const;

export const PRODUCT_SPECIFICATION_SOURCE_HEADERS = [
  "sku",
  "product_slug",
  "field_name",
  "extracted_value",
  "normalized_value",
  "source_url",
  "source_page_title",
  "source_section",
  "source_text",
  "source_type",
  "confidence",
  "conflict_status",
  "use_status",
  "checked_at",
  "notes"
] as const;

export const SOURCE_MATCH_TYPES = ["exact", "strong", "partial", "none"] as const;
export const SOURCE_CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;
export const SOURCE_TYPES = ["product-page", "category-page", "company-capability", "drawing", "datasheet"] as const;
export const SOURCE_CONFLICT_STATUSES = ["none", "same-page-conflict", "cross-page-conflict", "ambiguous"] as const;
export const SOURCE_USE_STATUSES = ["accepted", "candidate", "tbd", "rejected"] as const;

export type ProductSourceMatchType = (typeof SOURCE_MATCH_TYPES)[number];
export type ProductSourceConfidence = (typeof SOURCE_CONFIDENCE_LEVELS)[number];
export type ProductSpecificationSourceType = (typeof SOURCE_TYPES)[number];
export type ProductSpecificationConflictStatus = (typeof SOURCE_CONFLICT_STATUSES)[number];
export type ProductSpecificationUseStatus = (typeof SOURCE_USE_STATUSES)[number];

export type ProductSourceMappingRecord = Record<(typeof PRODUCT_SOURCE_MAPPING_HEADERS)[number], string>;
export type ProductSpecificationSourceRecord = Record<(typeof PRODUCT_SPECIFICATION_SOURCE_HEADERS)[number], string>;

type CsvReadResult<T> = { records: T[]; errors: string[] };

function readStrictCsv<T extends Record<string, string>>(filePath: string, expectedHeaders: readonly string[]): CsvReadResult<T> {
  if (!fs.existsSync(filePath)) return { records: [], errors: [`Required CSV file does not exist: ${filePath}`] };
  const parsed = parseCsvRecords(fs.readFileSync(filePath, "utf8"));
  const errors: string[] = [];
  if (parsed.headers.length !== expectedHeaders.length || parsed.headers.some((header, index) => header !== expectedHeaders[index])) {
    errors.push(`${path.basename(filePath)} headers do not match the required order.`);
  }
  const records = parsed.records.map((record) =>
    Object.fromEntries(expectedHeaders.map((header) => [header, record[header] ?? ""])) as T
  );
  return { records, errors };
}

export function readProductSourceMappings(
  filePath = path.join(process.cwd(), "data", "product-source-mapping.csv")
): CsvReadResult<ProductSourceMappingRecord> {
  return readStrictCsv<ProductSourceMappingRecord>(filePath, PRODUCT_SOURCE_MAPPING_HEADERS);
}

export function readProductSpecificationSources(
  filePath = path.join(process.cwd(), "data", "product-specification-sources.csv")
): CsvReadResult<ProductSpecificationSourceRecord> {
  return readStrictCsv<ProductSpecificationSourceRecord>(filePath, PRODUCT_SPECIFICATION_SOURCE_HEADERS);
}

export function isSpecificationField(value: string): value is SpecificationField {
  return (SPECIFICATION_HEADERS as readonly string[]).includes(value);
}

export function getSpecificationSourcePresentation(sku: string): {
  approximateFields: SpecificationField[];
  conflictedFields: SpecificationField[];
} {
  const records = readProductSpecificationSources().records.filter((record) => record.sku === sku && isSpecificationField(record.field_name));
  const approximateFields = new Set<SpecificationField>();
  const conflictedFields = new Set<SpecificationField>();

  for (const record of records) {
    const field = record.field_name as SpecificationField;
    if (record.conflict_status !== "none") conflictedFields.add(field);
    if (
      record.use_status === "accepted" &&
      /\b(?:about|approximate|approximately|circa)\b/i.test(`${record.source_text} ${record.notes}`)
    ) {
      approximateFields.add(field);
    }
  }

  return { approximateFields: [...approximateFields], conflictedFields: [...conflictedFields] };
}
