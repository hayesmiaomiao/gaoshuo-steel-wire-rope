import fs from "node:fs";
import path from "node:path";
import { serializeCsv, type CsvRecord } from "../src/lib/csv";
import { getAllProducts } from "../src/lib/products/data";
import {
  LOAD_UNITS,
  MIN_MAX_FIELD_PAIRS,
  NUMERIC_SPECIFICATION_FIELDS,
  SPECIFICATION_DATA_FIELDS,
  SPECIFICATION_HEADERS,
  SPECIFICATION_STATUSES,
  isConfirmedSpecificationValue,
  isNotApplicable,
  isTbd,
  type SpecificationRecord
} from "../src/lib/products/specification-model";
import {
  SOURCE_CONFIDENCE_LEVELS,
  SOURCE_CONFLICT_STATUSES,
  SOURCE_MATCH_TYPES,
  SOURCE_TYPES,
  SOURCE_USE_STATUSES,
  isSpecificationField,
  readProductSourceMappings,
  readProductSpecificationSources
} from "../src/lib/products/specification-sources";
import { publicDocumentExists, readProductSpecifications } from "../src/lib/products/specifications";
import { parseCsvRecords } from "../src/lib/csv";

type ValidationIssue = {
  sku: string;
  severity: "error" | "warning";
  code: string;
  field: string;
  message: string;
};

const root = process.cwd();
const reportCsvPath = path.join(root, "reports", "product-specification-validation.csv");
const reportMarkdownPath = path.join(root, "reports", "product-specification-validation.md");
const readResult = readProductSpecifications();
const specifications = readResult.specifications;
const mappingResult = readProductSourceMappings();
const sourceResult = readProductSpecificationSources();
const mappings = mappingResult.records;
const sourceRecords = sourceResult.records;
const products = getAllProducts().filter((product) => product.status === "published" && product.publishableBoolean);
const productsBySku = new Map(products.map((product) => [product.sku, product]));
const issues: ValidationIssue[] = [...readResult.errors, ...mappingResult.errors, ...sourceResult.errors].map((message) => ({ sku: "", severity: "error", code: "headers", field: "", message }));
const numericPattern = /^-?\d+(?:\.\d+)?$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const authorizedHosts = new Set([
  ["www", "wireropeassy", "com"].join("."),
  ["m", "wireropeassy", "com"].join(".")
]);
const blockedProductionTerms = [
  ["guo", "feng"].join(""),
  ["wireropeassy", "com"].join("."),
  ["wire rope", "assy"].join(" ")
];

function addIssue(issue: ValidationIssue): void {
  issues.push(issue);
}

function isNumeric(value: string): boolean {
  return numericPattern.test(value.trim());
}

function isAuthorizedSourceUrl(value: string): boolean {
  if (value.startsWith("/documents/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && authorizedHosts.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function validateDocumentPath(record: SpecificationRecord, field: "drawing_file" | "datasheet_file"): void {
  const value = record[field].trim();
  if (isTbd(value) || isNotApplicable(value)) return;
  if (/^https?:\/\//i.test(value)) {
    addIssue({ sku: record.sku, severity: "error", code: "external_document", field, message: "External document URLs are not allowed." });
    return;
  }
  if (/^[A-Za-z]:[\\/]/.test(value) || value.includes("\\")) {
    addIssue({ sku: record.sku, severity: "error", code: "windows_path", field, message: "Windows absolute or backslash document paths are not allowed." });
    return;
  }
  if (!value.startsWith("/documents/")) {
    addIssue({ sku: record.sku, severity: "error", code: "invalid_document_path", field, message: "Document paths must be under /documents/." });
    return;
  }
  if (!publicDocumentExists(value)) {
    addIssue({ sku: record.sku, severity: "error", code: "missing_document", field, message: `Document does not exist in public: ${value}` });
  }
}

const mappingsBySku = new Map<string, (typeof mappings)[number]>();
for (const mapping of mappings) {
  if (mappingsBySku.has(mapping.sku)) {
    addIssue({ sku: mapping.sku, severity: "error", code: "duplicate_mapping", field: "sku", message: "Duplicate SKU in product-source-mapping.csv." });
  }
  mappingsBySku.set(mapping.sku, mapping);
  const product = productsBySku.get(mapping.sku);
  if (!product) {
    addIssue({ sku: mapping.sku, severity: "error", code: "mapping_invalid_sku", field: "sku", message: "Mapping SKU is not a published and publishable product." });
  } else {
    if (mapping.product_slug !== product.slug) addIssue({ sku: mapping.sku, severity: "error", code: "mapping_slug_mismatch", field: "product_slug", message: `Expected slug ${product.slug}.` });
    if (mapping.product_name !== product.product_name) addIssue({ sku: mapping.sku, severity: "error", code: "mapping_name_mismatch", field: "product_name", message: `Expected product name ${product.product_name}.` });
    if (mapping.category !== product.category) addIssue({ sku: mapping.sku, severity: "error", code: "mapping_category_mismatch", field: "category", message: `Expected category ${product.category}.` });
  }
  if (!SOURCE_MATCH_TYPES.includes(mapping.match_type as (typeof SOURCE_MATCH_TYPES)[number])) {
    addIssue({ sku: mapping.sku, severity: "error", code: "invalid_match_type", field: "match_type", message: `Allowed values: ${SOURCE_MATCH_TYPES.join(", ")}.` });
  }
  if (!SOURCE_CONFIDENCE_LEVELS.includes(mapping.match_confidence as (typeof SOURCE_CONFIDENCE_LEVELS)[number])) {
    addIssue({ sku: mapping.sku, severity: "error", code: "invalid_match_confidence", field: "match_confidence", message: `Allowed values: ${SOURCE_CONFIDENCE_LEVELS.join(", ")}.` });
  }
  for (const [field, value] of [["source_url", mapping.source_url], ["secondary_source_url", mapping.secondary_source_url]] as const) {
    if (value && !isAuthorizedSourceUrl(value)) addIssue({ sku: mapping.sku, severity: "error", code: "unauthorized_source_url", field, message: "Source URL is outside the authorized reference hosts." });
  }
}

for (const product of products) {
  if (!mappingsBySku.has(product.sku)) addIssue({ sku: product.sku, severity: "error", code: "missing_mapping", field: "sku", message: "Published product is missing from product-source-mapping.csv." });
}

const acceptedSourcesBySkuField = new Map<string, (typeof sourceRecords)[number][]>();
const conflictedFieldsBySku = new Map<string, Set<string>>();
for (const source of sourceRecords) {
  const isGlobal = source.sku === "GLOBAL" && source.source_type === "company-capability";
  const product = productsBySku.get(source.sku);
  if (!isGlobal && !product) {
    addIssue({ sku: source.sku, severity: "error", code: "source_invalid_sku", field: "sku", message: "Source record SKU is not a published and publishable product." });
  } else if (product && source.product_slug !== product.slug) {
    addIssue({ sku: source.sku, severity: "error", code: "source_slug_mismatch", field: "product_slug", message: `Expected slug ${product.slug}.` });
  }
  if (!isSpecificationField(source.field_name) || !SPECIFICATION_DATA_FIELDS.includes(source.field_name as (typeof SPECIFICATION_DATA_FIELDS)[number])) {
    addIssue({ sku: source.sku, severity: "error", code: "invalid_source_field", field: "field_name", message: "Source record field_name must be a technical specification data field." });
  }
  if (!SOURCE_TYPES.includes(source.source_type as (typeof SOURCE_TYPES)[number])) {
    addIssue({ sku: source.sku, severity: "error", code: "invalid_source_type", field: "source_type", message: `Allowed values: ${SOURCE_TYPES.join(", ")}.` });
  }
  if (!SOURCE_CONFIDENCE_LEVELS.includes(source.confidence as (typeof SOURCE_CONFIDENCE_LEVELS)[number])) {
    addIssue({ sku: source.sku, severity: "error", code: "invalid_source_confidence", field: "confidence", message: `Allowed values: ${SOURCE_CONFIDENCE_LEVELS.join(", ")}.` });
  }
  if (!SOURCE_CONFLICT_STATUSES.includes(source.conflict_status as (typeof SOURCE_CONFLICT_STATUSES)[number])) {
    addIssue({ sku: source.sku, severity: "error", code: "invalid_conflict_status", field: "conflict_status", message: `Allowed values: ${SOURCE_CONFLICT_STATUSES.join(", ")}.` });
  }
  if (!SOURCE_USE_STATUSES.includes(source.use_status as (typeof SOURCE_USE_STATUSES)[number])) {
    addIssue({ sku: source.sku, severity: "error", code: "invalid_use_status", field: "use_status", message: `Allowed values: ${SOURCE_USE_STATUSES.join(", ")}.` });
  }
  if (!isAuthorizedSourceUrl(source.source_url)) {
    addIssue({ sku: source.sku, severity: "error", code: "unauthorized_source_url", field: "source_url", message: "Source URL is outside the authorized reference hosts." });
  }
  if (source.use_status === "accepted") {
    if (!["product-page", "drawing", "datasheet"].includes(source.source_type)) {
      addIssue({ sku: source.sku, severity: "error", code: "invalid_accepted_source", field: "source_type", message: "Accepted values must come from a product page, drawing or datasheet." });
    }
    if (source.source_type === "company-capability") {
      addIssue({ sku: source.sku, severity: "error", code: "company_value_accepted", field: source.field_name, message: "Company-level capability cannot be accepted as a SKU parameter." });
    }
    if (source.conflict_status !== "none") {
      addIssue({ sku: source.sku, severity: "error", code: "conflicted_value_accepted", field: source.field_name, message: "A conflicted or ambiguous value cannot be accepted." });
    }
    const key = `${source.sku}\u0000${source.field_name}`;
    acceptedSourcesBySkuField.set(key, [...(acceptedSourcesBySkuField.get(key) ?? []), source]);
  }
  if (source.conflict_status !== "none" && !isGlobal) {
    const set = conflictedFieldsBySku.get(source.sku) ?? new Set<string>();
    set.add(source.field_name);
    conflictedFieldsBySku.set(source.sku, set);
  }
}

const seen = new Set<string>();
for (const record of specifications) {
  if (seen.has(record.sku)) addIssue({ sku: record.sku, severity: "error", code: "duplicate_sku", field: "sku", message: "Duplicate SKU in product-specifications.csv." });
  seen.add(record.sku);

  const product = productsBySku.get(record.sku);
  if (!product) {
    addIssue({ sku: record.sku, severity: "error", code: "invalid_sku", field: "sku", message: "SKU does not exist in the published and publishable product library." });
  } else {
    if (record.product_slug !== product.slug) addIssue({ sku: record.sku, severity: "error", code: "slug_mismatch", field: "product_slug", message: `Expected slug ${product.slug}.` });
    if (record.product_name !== product.product_name) addIssue({ sku: record.sku, severity: "error", code: "name_mismatch", field: "product_name", message: `Expected product name ${product.product_name}.` });
  }

  for (const field of SPECIFICATION_HEADERS) {
    const value = record[field];
    if (value === "" && field !== "reviewed_by" && field !== "reviewed_at") {
      addIssue({ sku: record.sku, severity: "error", code: "empty_value", field, message: "Use TBD or N/A instead of an empty string." });
    }
    const normalized = value.trim().toUpperCase();
    if ((normalized === "TBD" && value !== "TBD") || (normalized === "N/A" && value !== "N/A")) {
      addIssue({ sku: record.sku, severity: "error", code: "marker_case", field, message: "TBD and N/A must use consistent uppercase spelling." });
    }
  }

  for (const field of SPECIFICATION_DATA_FIELDS) {
    const value = record[field];
    if (!isConfirmedSpecificationValue(value)) continue;
    const accepted = acceptedSourcesBySkuField.get(`${record.sku}\u0000${field}`) ?? [];
    if (!accepted.some((source) => source.normalized_value === value)) {
      addIssue({ sku: record.sku, severity: "error", code: "missing_field_source", field, message: "Confirmed value has no matching accepted field-level source record." });
    }
  }

  const mapping = mappingsBySku.get(record.sku);
  if (mapping && ["partial", "none"].includes(mapping.match_type) && record.verification_status !== "approved") {
    const confirmed = SPECIFICATION_DATA_FIELDS.filter((field) => isConfirmedSpecificationValue(record[field]));
    if (confirmed.length > 0) {
      addIssue({ sku: record.sku, severity: "error", code: "partial_value_published", field: confirmed.join("|"), message: "Partial or unmatched source mapping cannot populate formal SKU parameters." });
    }
  }

  if (record.verification_status !== "approved") {
    for (const field of conflictedFieldsBySku.get(record.sku) ?? []) {
      if (isSpecificationField(field) && !isTbd(record[field])) {
        addIssue({ sku: record.sku, severity: "error", code: "conflict_value_selected", field, message: "Conflicted or ambiguous source field must remain TBD." });
      }
    }
  }

  if (/\b(?:ISO\s*9001|IATF\s*16949)\b/i.test(record.applicable_standard)) {
    addIssue({ sku: record.sku, severity: "error", code: "enterprise_cert_as_standard", field: "applicable_standard", message: "Enterprise management-system certification cannot be used as a product standard." });
  }

  const formalText = SPECIFICATION_HEADERS.map((field) => record[field]).join("\n");
  for (const term of blockedProductionTerms) {
    if (formalText.toLowerCase().includes(term.toLowerCase())) {
      addIssue({ sku: record.sku, severity: "error", code: "source_brand_leak", field: "", message: "Source brand or domain entered the formal specification file." });
    }
  }
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(formalText) || /\bwhats\s*app\b/i.test(formalText) || /(?:\+?86[-\s]?)?1[3-9]\d{9}/.test(formalText)) {
    addIssue({ sku: record.sku, severity: "error", code: "source_contact_leak", field: "", message: "Email, phone or messaging contact data entered the formal specification file." });
  }

  for (const field of NUMERIC_SPECIFICATION_FIELDS) {
    const value = record[field].trim();
    if (isTbd(value) || isNotApplicable(value)) continue;
    if (!isNumeric(value)) addIssue({ sku: record.sku, severity: "error", code: "numeric_format", field, message: "Numeric fields must contain numbers only, without units." });
  }

  for (const [minimumField, maximumField] of MIN_MAX_FIELD_PAIRS) {
    const minimum = record[minimumField].trim();
    const maximum = record[maximumField].trim();
    const minimumNumeric = isNumeric(minimum);
    const maximumNumeric = isNumeric(maximum);
    if (minimumNumeric !== maximumNumeric) {
      addIssue({ sku: record.sku, severity: "error", code: "incomplete_range", field: `${minimumField}|${maximumField}`, message: "Both range endpoints must be supplied; fixed dimensions repeat the same value in min and max." });
    }
    if (minimumNumeric && maximumNumeric && Number(minimum) > Number(maximum)) {
      addIssue({ sku: record.sku, severity: "error", code: "range_order", field: `${minimumField}|${maximumField}`, message: "Minimum value is greater than maximum value." });
    }
  }

  if (isNotApplicable(record.coating_material) && (isNumeric(record.finished_diameter_min_mm) || isNumeric(record.finished_diameter_max_mm))) {
    addIssue({ sku: record.sku, severity: "error", code: "coating_conflict", field: "coating_material", message: "Finished coated diameter cannot be numeric when coating material is N/A." });
  }
  if (isConfirmedSpecificationValue(record.coating_material) && (isTbd(record.finished_diameter_min_mm) || isTbd(record.finished_diameter_max_mm))) {
    addIssue({ sku: record.sku, severity: "warning", code: "missing_finished_diameter", field: "finished_diameter_min_mm|finished_diameter_max_mm", message: "Confirmed coating material should be paired with a confirmed finished diameter range." });
  }

  const validLoadUnit = LOAD_UNITS.includes(record.load_unit as (typeof LOAD_UNITS)[number]);
  if (!validLoadUnit) addIssue({ sku: record.sku, severity: "error", code: "invalid_load_unit", field: "load_unit", message: `Allowed values: ${LOAD_UNITS.join(", ")}.` });
  if (isNumeric(record.breaking_load) && !["N", "kN", "kgf", "lbf"].includes(record.load_unit)) {
    addIssue({ sku: record.sku, severity: "error", code: "missing_load_unit", field: "breaking_load|load_unit", message: "Numeric breaking load requires an allowed load unit." });
  }
  if (isNumeric(record.working_load) && !["N", "kN", "kgf", "lbf"].includes(record.load_unit)) {
    addIssue({ sku: record.sku, severity: "error", code: "missing_load_unit", field: "working_load|load_unit", message: "Numeric working load requires an allowed load unit." });
  }
  if (isNumeric(record.breaking_load) && isNumeric(record.working_load) && Number(record.working_load) > Number(record.breaking_load)) {
    addIssue({ sku: record.sku, severity: "error", code: "working_load_exceeds_breaking_load", field: "working_load", message: "Working load cannot exceed minimum breaking load when the shared unit is the same." });
  }

  if (!SPECIFICATION_STATUSES.includes(record.verification_status as (typeof SPECIFICATION_STATUSES)[number])) {
    addIssue({ sku: record.sku, severity: "error", code: "invalid_status", field: "verification_status", message: `Allowed values: ${SPECIFICATION_STATUSES.join(", ")}.` });
  }
  if (record.verification_status === "approved") {
    const tbdFields = SPECIFICATION_DATA_FIELDS.filter((field) => isTbd(record[field]));
    if (tbdFields.length > 0) addIssue({ sku: record.sku, severity: "error", code: "approved_has_tbd", field: tbdFields.join("|"), message: "Approved specifications cannot contain TBD values." });
    if (!record.reviewed_by.trim()) addIssue({ sku: record.sku, severity: "error", code: "approved_missing_reviewer", field: "reviewed_by", message: "Approved specifications require a reviewer." });
    if (!datePattern.test(record.reviewed_at)) addIssue({ sku: record.sku, severity: "error", code: "approved_missing_review_date", field: "reviewed_at", message: "Approved specifications require a YYYY-MM-DD review date." });
  } else if (record.reviewed_at && !datePattern.test(record.reviewed_at)) {
    addIssue({ sku: record.sku, severity: "error", code: "invalid_review_date", field: "reviewed_at", message: "Review date must use YYYY-MM-DD." });
  }

  if (record.construction.includes("×")) addIssue({ sku: record.sku, severity: "error", code: "construction_format", field: "construction", message: "Use lowercase x instead of the multiplication symbol." });
  validateDocumentPath(record, "drawing_file");
  validateDocumentPath(record, "datasheet_file");
}

for (const product of products) {
  if (!seen.has(product.sku)) addIssue({ sku: product.sku, severity: "error", code: "missing_sku", field: "sku", message: "Published and publishable product is missing from product-specifications.csv." });
}

for (const mapping of mappings) {
  if (!["partial", "none"].includes(mapping.match_type)) continue;
  const accepted = sourceRecords.filter((source) => source.sku === mapping.sku && source.use_status === "accepted");
  if (accepted.length > 0) {
    addIssue({ sku: mapping.sku, severity: "error", code: "accepted_source_for_partial_match", field: accepted.map((source) => source.field_name).join("|"), message: "Partial or unmatched products cannot have accepted field sources." });
  }
}

const approvedBaselinePath = path.join(root, "reports", "product-specification-approved-baseline.csv");
if (fs.existsSync(approvedBaselinePath)) {
  const baseline = parseCsvRecords(fs.readFileSync(approvedBaselinePath, "utf8"));
  if (baseline.headers.length !== SPECIFICATION_HEADERS.length || baseline.headers.some((header, index) => header !== SPECIFICATION_HEADERS[index])) {
    addIssue({ sku: "", severity: "error", code: "approved_baseline_headers", field: "", message: "Approved baseline headers do not match the specification schema." });
  } else {
    const currentBySku = new Map(specifications.map((record) => [record.sku, record]));
    for (const baselineRecord of baseline.records) {
      const current = currentBySku.get(baselineRecord.sku);
      if (!current) {
        addIssue({ sku: baselineRecord.sku, severity: "error", code: "approved_record_removed", field: "sku", message: "An approved baseline record was removed." });
        continue;
      }
      const changed = SPECIFICATION_HEADERS.filter((field) => current[field] !== baselineRecord[field]);
      if (changed.length > 0) {
        addIssue({ sku: baselineRecord.sku, severity: "error", code: "approved_record_overwritten", field: changed.join("|"), message: "Previously approved data changed during source synchronization." });
      }
    }
  }
}

fs.mkdirSync(path.dirname(reportCsvPath), { recursive: true });
const reportRows: CsvRecord[] = issues.map((issue) => ({ ...issue }));
fs.writeFileSync(reportCsvPath, serializeCsv(["sku", "severity", "code", "field", "message"], reportRows), "utf8");
const markdown = [
  "# Product Specification Validation",
  "",
  `- Rows checked: ${specifications.length}`,
  `- Errors: ${issues.filter((issue) => issue.severity === "error").length}`,
  `- Warnings: ${issues.filter((issue) => issue.severity === "warning").length}`,
  "",
  ...(issues.length === 0
    ? ["No validation issues found."]
    : ["| SKU | Severity | Code | Field | Message |", "| --- | --- | --- | --- | --- |", ...issues.map((issue) => `| ${issue.sku || "-"} | ${issue.severity} | ${issue.code} | ${issue.field || "-"} | ${issue.message.replace(/\|/g, "\\|")} |`)]),
  ""
].join("\n");
fs.writeFileSync(reportMarkdownPath, markdown, "utf8");

const errorCount = issues.filter((issue) => issue.severity === "error").length;
const warningCount = issues.filter((issue) => issue.severity === "warning").length;
if (errorCount > 0) {
  console.error(`Product specification validation failed with ${errorCount} error(s) and ${warningCount} warning(s).`);
  process.exit(1);
}
console.log(`Product specification validation passed for ${specifications.length} rows with ${warningCount} warning(s).`);
