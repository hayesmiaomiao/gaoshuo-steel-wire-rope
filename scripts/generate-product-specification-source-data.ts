import fs from "node:fs";
import path from "node:path";
import { serializeCsv, type CsvRecord } from "../src/lib/csv";
import { getAllProducts } from "../src/lib/products/data";
import {
  CHINESE_HEADER_MAP,
  CHINESE_SPECIFICATION_HEADERS,
  SPECIFICATION_DATA_FIELDS,
  SPECIFICATION_HEADERS,
  createSpecificationTemplate,
  isConfirmedSpecificationValue,
  isNotApplicable,
  isTbd,
  type SpecificationField,
  type SpecificationRecord
} from "../src/lib/products/specification-model";
import {
  PRODUCT_SOURCE_MAPPING_HEADERS,
  PRODUCT_SPECIFICATION_SOURCE_HEADERS,
  type ProductSourceMappingRecord,
  type ProductSpecificationSourceRecord
} from "../src/lib/products/specification-sources";
import { readProductSpecifications } from "../src/lib/products/specifications";

const root = process.cwd();
const checkedAt = "2026-07-18";
const curationPath = path.join(root, "research", "wireropeassy-source-curation.json");
const pageCatalogPath = path.join(root, "research", "wireropeassy-product-pages.csv");
const mappingPath = path.join(root, "data", "product-source-mapping.csv");
const sourcePath = path.join(root, "data", "product-specification-sources.csv");
const chinesePath = path.join(root, "data", "product-specifications-zh.csv");
const auditCsvPath = path.join(root, "reports", "product-specification-source-audit.csv");
const auditMarkdownPath = path.join(root, "reports", "product-specification-source-audit.md");
const reviewHtmlPath = path.join(root, "reports", "product-specification-source-review.html");
const approvedBaselinePath = path.join(root, "reports", "product-specification-approved-baseline.csv");
const candidateFillPath = path.join(root, "reports", "product-specification-candidate-fill.csv");
const candidateOptionsPath = path.join(root, "reports", "product-specification-candidate-options.csv");
const candidateMarkdownPath = path.join(root, "reports", "product-specification-candidate-fill.md");

const PAGE_HEADERS = [
  "source_url",
  "mobile_source_url",
  "source_title",
  "source_category",
  "source_product_name",
  "page_status",
  "parameter_section_found",
  "drawing_found",
  "datasheet_found",
  "last_checked_at",
  "notes"
] as const;

const AUDIT_HEADERS = [
  "sku",
  "product_name",
  "category",
  "matched_source",
  "match_type",
  "match_confidence",
  "fields_extracted",
  "fields_tbd",
  "fields_conflicted",
  "company_level_values_rejected",
  "verification_status",
  "manual_review_required",
  "recommended_action"
] as const;

const CANDIDATE_METADATA_HEADERS = [
  "sku",
  "product_slug",
  "product_name",
  "category",
  "match_type",
  "match_confidence",
  "formal_verification_status",
  "candidate_field_count",
  "candidate_only_field_count",
  "conflict_field_count",
  "unresolved_tbd_count",
  "internal_status",
  "source_urls",
  "notes"
] as const;

const CANDIDATE_OPTION_HEADERS = [
  "sku",
  "product_slug",
  "product_name",
  "category",
  "field_name",
  "formal_value",
  "candidate_value",
  "candidate_basis",
  "source_values",
  "source_urls",
  "source_statuses",
  "conflict_statuses",
  "source_text",
  "manual_review_required",
  "notes"
] as const;

type PageInput = Omit<Record<(typeof PAGE_HEADERS)[number], string>, "last_checked_at">;
type MappingInput = Omit<ProductSourceMappingRecord, "product_slug" | "product_name" | "category">;
type AcceptedGroup = {
  sku: string;
  source_url: string;
  source_page_title: string;
  source_section: string;
  source_text: string;
  confidence: string;
  fields: Partial<Record<SpecificationField, string>>;
  notes: string;
};
type ConflictInput = {
  skus: string[];
  field_name: SpecificationField;
  source_url: string;
  source_page_title: string;
  source_section: string;
  values: { extracted_value: string; normalized_value: string; source_text: string }[];
  conflict_status: string;
  notes: string;
};
type CandidateInput = {
  sku: string;
  field_name: SpecificationField;
  normalized_value: string;
  source_url: string;
  source_page_title: string;
  source_type: string;
  source_text: string;
  confidence: string;
  conflict_status: string;
  notes: string;
  use_status?: string;
};
type CandidateGroupInput = {
  sku: string;
  source_url: string;
  source_page_title: string;
  source_type: string;
  source_text: string;
  confidence: string;
  conflict_status: string;
  fields: Partial<Record<SpecificationField, string>>;
  notes: string;
};
type CompanyRejectionInput = {
  field_name: SpecificationField;
  extracted_value: string;
  normalized_value: string;
  source_url: string;
  source_page_title: string;
  source_text: string;
  notes: string;
};
type CurationFile = {
  checked_at: string;
  pages: PageInput[];
  mappings: MappingInput[];
  accepted_groups: AcceptedGroup[];
  conflicts: ConflictInput[];
  candidate_groups: CandidateGroupInput[];
  candidates: CandidateInput[];
  company_rejections: CompanyRejectionInput[];
};

function readCuration(): CurationFile {
  if (!fs.existsSync(curationPath)) throw new Error(`Missing curation file: ${curationPath}`);
  return JSON.parse(fs.readFileSync(curationPath, "utf8")) as CurationFile;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character] ?? character));
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

const curation = readCuration();
if (curation.checked_at !== checkedAt) throw new Error(`Expected checked_at ${checkedAt}, received ${curation.checked_at}.`);

const products = getAllProducts().filter((product) => product.status === "published" && product.publishableBoolean);
const productsBySku = new Map(products.map((product) => [product.sku, product]));
if (products.length !== 26) throw new Error(`Expected 26 published and publishable products, found ${products.length}.`);

const mappingInputsBySku = new Map(curation.mappings.map((mapping) => [mapping.sku, mapping]));
const mappings: ProductSourceMappingRecord[] = products.map((product) => {
  const input = mappingInputsBySku.get(product.sku);
  if (!input) throw new Error(`Missing source mapping for ${product.sku}.`);
  return {
    sku: product.sku,
    product_slug: product.slug,
    product_name: product.product_name,
    category: product.category,
    source_url: input.source_url,
    secondary_source_url: input.secondary_source_url,
    source_product_name: input.source_product_name,
    match_type: input.match_type,
    match_confidence: input.match_confidence,
    match_reason: input.match_reason,
    parameter_conflict: input.parameter_conflict,
    review_status: input.review_status,
    notes: input.notes
  };
});
const mappingsBySku = new Map(mappings.map((mapping) => [mapping.sku, mapping]));

const sourceRecords: ProductSpecificationSourceRecord[] = [];
function addSource(record: ProductSpecificationSourceRecord): void {
  sourceRecords.push(record);
}

for (const group of curation.accepted_groups) {
  const product = productsBySku.get(group.sku);
  const mapping = mappingsBySku.get(group.sku);
  if (!product || !mapping) throw new Error(`Unknown accepted-source SKU: ${group.sku}`);
  if (!['exact', 'strong'].includes(mapping.match_type)) throw new Error(`Accepted source found for non-exact/strong mapping: ${group.sku}`);
  for (const [fieldName, normalizedValue] of Object.entries(group.fields) as [SpecificationField, string][]) {
    addSource({
      sku: product.sku,
      product_slug: product.slug,
      field_name: fieldName,
      extracted_value: normalizedValue,
      normalized_value: normalizedValue,
      source_url: group.source_url,
      source_page_title: group.source_page_title,
      source_section: group.source_section,
      source_text: group.source_text,
      source_type: "product-page",
      confidence: group.confidence,
      conflict_status: "none",
      use_status: "accepted",
      checked_at: checkedAt,
      notes: group.notes
    });
  }
}

for (const conflict of curation.conflicts) {
  for (const sku of conflict.skus) {
    const product = productsBySku.get(sku);
    if (!product) throw new Error(`Unknown conflict-source SKU: ${sku}`);
    for (const value of conflict.values) {
      addSource({
        sku,
        product_slug: product.slug,
        field_name: conflict.field_name,
        extracted_value: value.extracted_value,
        normalized_value: value.normalized_value,
        source_url: conflict.source_url,
        source_page_title: conflict.source_page_title,
        source_section: conflict.source_section,
        source_text: value.source_text,
        source_type: "product-page",
        confidence: "medium",
        conflict_status: conflict.conflict_status,
        use_status: "tbd",
        checked_at: checkedAt,
        notes: conflict.notes
      });
    }
  }
}

for (const group of curation.candidate_groups) {
  const product = productsBySku.get(group.sku);
  if (!product) throw new Error(`Unknown candidate-group SKU: ${group.sku}`);
  for (const [fieldName, normalizedValue] of Object.entries(group.fields) as [SpecificationField, string][]) {
    addSource({
      sku: product.sku,
      product_slug: product.slug,
      field_name: fieldName,
      extracted_value: normalizedValue,
      normalized_value: normalizedValue,
      source_url: group.source_url,
      source_page_title: group.source_page_title,
      source_section: "Internal Candidate Reference",
      source_text: group.source_text,
      source_type: group.source_type,
      confidence: group.confidence,
      conflict_status: group.conflict_status,
      use_status: "candidate",
      checked_at: checkedAt,
      notes: group.notes
    });
  }
}

for (const candidate of curation.candidates) {
  const product = productsBySku.get(candidate.sku);
  if (!product) throw new Error(`Unknown candidate-source SKU: ${candidate.sku}`);
  addSource({
    sku: product.sku,
    product_slug: product.slug,
    field_name: candidate.field_name,
    extracted_value: candidate.normalized_value,
    normalized_value: candidate.normalized_value,
    source_url: candidate.source_url,
    source_page_title: candidate.source_page_title,
    source_section: "Candidate Reference",
    source_text: candidate.source_text,
    source_type: candidate.source_type,
    confidence: candidate.confidence,
    conflict_status: candidate.conflict_status,
    use_status: candidate.use_status ?? "candidate",
    checked_at: checkedAt,
    notes: candidate.notes
  });
}

for (const rejected of curation.company_rejections) {
  addSource({
    sku: "GLOBAL",
    product_slug: "N/A",
    field_name: rejected.field_name,
    extracted_value: rejected.extracted_value,
    normalized_value: rejected.normalized_value,
    source_url: rejected.source_url,
    source_page_title: rejected.source_page_title,
    source_section: "Company Capability",
    source_text: rejected.source_text,
    source_type: "company-capability",
    confidence: "high",
    conflict_status: "none",
    use_status: "rejected",
    checked_at: checkedAt,
    notes: rejected.notes
  });
}

const existing = readProductSpecifications().specifications;
const existingBySku = new Map(existing.map((record) => [record.sku, record]));
const approvedBaseline = existing.filter((record) => record.verification_status === "approved");

const plannedSpecifications: SpecificationRecord[] = products.map((product) => {
  const current = existingBySku.get(product.sku);
  if (current?.verification_status === "approved") return { ...current };

  const record = createSpecificationTemplate(product);
  const accepted = sourceRecords.filter((source) => source.sku === product.sku && source.use_status === "accepted");
  for (const source of accepted) {
    record[source.field_name as SpecificationField] = source.normalized_value;
  }
  record.verification_status = accepted.length > 0 ? "incomplete" : "unverified";
  record.reviewed_by = "";
  record.reviewed_at = "";
  record.notes = accepted.length > 0
    ? "Source-backed fields are incomplete and require manual confirmation. Evidence and conflicts are recorded in internal audit files."
    : "No sufficiently matched product-page evidence was accepted. Applicable fields remain to be confirmed.";
  return record;
});

const chineseStatus: Record<string, string> = {
  unverified: "未验证",
  incomplete: "不完整",
  reviewed: "已审核",
  approved: "已批准",
  rejected: "已拒绝"
};

const chineseRows: CsvRecord[] = plannedSpecifications.map((record) => {
  const mapping = mappingsBySku.get(record.sku);
  if (!mapping) throw new Error(`Missing mapping for ${record.sku}.`);
  const output: CsvRecord = {};
  for (const field of SPECIFICATION_HEADERS) output[CHINESE_HEADER_MAP[field]] = record[field];
  output[CHINESE_HEADER_MAP.verification_status] = chineseStatus[record.verification_status] ?? record.verification_status;
  output[CHINESE_HEADER_MAP.notes] = record.verification_status === "approved"
    ? record.notes
    : `参考来源URL：见 data/product-specification-sources.csv；匹配类型：${mapping.match_type}；匹配置信度：${mapping.match_confidence}；存在冲突：${mapping.parameter_conflict === "yes" ? "是" : "否"}；需要人工确认：是`;
  return output;
});

const pageRows: CsvRecord[] = curation.pages.map((page) => ({ ...page, last_checked_at: checkedAt }));
const acceptedBySku = new Map<string, string[]>();
const conflictedBySku = new Map<string, string[]>();
for (const source of sourceRecords) {
  if (source.use_status === "accepted") acceptedBySku.set(source.sku, unique([...(acceptedBySku.get(source.sku) ?? []), source.field_name]));
  if (source.conflict_status !== "none") conflictedBySku.set(source.sku, unique([...(conflictedBySku.get(source.sku) ?? []), source.field_name]));
}

const auditRows: CsvRecord[] = plannedSpecifications.map((record) => {
  const mapping = mappingsBySku.get(record.sku) as ProductSourceMappingRecord;
  const tbdFields = SPECIFICATION_DATA_FIELDS.filter((field) => isTbd(record[field]));
  const conflicts = conflictedBySku.get(record.sku) ?? [];
  const recommendedAction = mapping.match_type === "none"
    ? "Find a direct product detail page or obtain a Gaoshuo drawing/datasheet."
    : mapping.match_type === "partial"
      ? "Confirm product identity before accepting any candidate value."
      : conflicts.length > 0
        ? "Resolve conflicts and confirm the selected configuration before review."
        : "Verify extracted options against the intended Gaoshuo configuration before review.";
  return {
    sku: record.sku,
    product_name: record.product_name,
    category: mapping.category,
    matched_source: mapping.source_url || "None",
    match_type: mapping.match_type,
    match_confidence: mapping.match_confidence,
    fields_extracted: (acceptedBySku.get(record.sku) ?? []).join(";"),
    fields_tbd: tbdFields.join(";"),
    fields_conflicted: conflicts.join(";"),
    company_level_values_rejected: String(curation.company_rejections.length),
    verification_status: record.verification_status,
    manual_review_required: "yes",
    recommended_action: recommendedAction
  };
});

type CandidateFieldResult = {
  value: string;
  basis: "accepted" | "conflict-options" | "ambiguous-candidate" | "candidate" | "no-source";
  records: ProductSpecificationSourceRecord[];
};

function candidateField(record: SpecificationRecord, field: SpecificationField): CandidateFieldResult {
  const records = sourceRecords.filter((source) => source.sku === record.sku && source.field_name === field);
  const formalValue = record[field];
  if (isConfirmedSpecificationValue(formalValue)) return { value: formalValue, basis: "accepted", records };

  const usable = records.filter((source) => source.use_status !== "rejected" && !isTbd(source.normalized_value) && !isNotApplicable(source.normalized_value));
  const values = unique(usable.map((source) => source.normalized_value));
  if (values.length === 0) return { value: formalValue, basis: "no-source", records };

  const conflictStatuses = unique(usable.map((source) => source.conflict_status).filter((status) => status !== "none"));
  if (conflictStatuses.some((status) => status === "same-page-conflict" || status === "cross-page-conflict")) {
    return { value: `CONFLICT: ${values.join(" || ")}`, basis: "conflict-options", records };
  }
  if (conflictStatuses.includes("ambiguous")) {
    return { value: `CANDIDATE: ${values.join(" || ")}`, basis: "ambiguous-candidate", records };
  }
  return { value: `CANDIDATE: ${values.join(" || ")}`, basis: "candidate", records };
}

const candidateOptionRows: CsvRecord[] = [];
const candidateFillRows: CsvRecord[] = plannedSpecifications.map((record) => {
  const mapping = mappingsBySku.get(record.sku) as ProductSourceMappingRecord;
  const fieldResults = new Map<SpecificationField, CandidateFieldResult>();
  for (const field of SPECIFICATION_DATA_FIELDS) fieldResults.set(field, candidateField(record, field));

  const applicableResults = [...fieldResults.entries()].filter(([field]) => !isNotApplicable(record[field]));
  const candidateCount = applicableResults.filter(([, result]) => result.value !== "TBD").length;
  const candidateOnlyCount = applicableResults.filter(([, result]) => !["accepted", "no-source"].includes(result.basis)).length;
  const conflictCount = applicableResults.filter(([, result]) => ["conflict-options", "ambiguous-candidate"].includes(result.basis)).length;
  const unresolvedCount = applicableResults.filter(([, result]) => result.basis === "no-source").length;
  const sourceUrls = unique(sourceRecords.filter((source) => source.sku === record.sku).map((source) => source.source_url));

  for (const [field, result] of applicableResults) {
    const records = result.records;
    const notes = result.basis === "accepted"
      ? "Formal accepted value copied for internal comparison."
      : result.basis === "conflict-options"
        ? "Unresolved source conflict; keep every listed option and do not publish without manual selection."
        : result.basis === "ambiguous-candidate"
          ? "Ambiguous or partial-match candidate; internal review only."
          : result.basis === "candidate"
            ? "Candidate reference value; internal review only."
            : "No source value available; remains TBD.";
    candidateOptionRows.push({
      sku: record.sku,
      product_slug: record.product_slug,
      product_name: record.product_name,
      category: mapping.category,
      field_name: field,
      formal_value: record[field],
      candidate_value: result.value,
      candidate_basis: result.basis,
      source_values: unique(records.map((source) => source.extracted_value).filter((value) => !isTbd(value))).join(" || "),
      source_urls: unique(records.map((source) => source.source_url)).join(";"),
      source_statuses: unique(records.map((source) => source.use_status)).join(";"),
      conflict_statuses: unique(records.map((source) => source.conflict_status)).join(";"),
      source_text: unique(records.map((source) => source.source_text)).join(" || "),
      manual_review_required: result.basis === "accepted" ? "yes-before-approval" : "yes",
      notes
    });
  }

  const output: CsvRecord = {
    sku: record.sku,
    product_slug: record.product_slug,
    product_name: record.product_name,
    category: mapping.category,
    match_type: mapping.match_type,
    match_confidence: mapping.match_confidence,
    formal_verification_status: record.verification_status,
    candidate_field_count: String(candidateCount),
    candidate_only_field_count: String(candidateOnlyCount),
    conflict_field_count: String(conflictCount),
    unresolved_tbd_count: String(unresolvedCount),
    internal_status: "manual-review-only",
    source_urls: sourceUrls.join(";"),
    notes: "Internal candidate sheet only. Not connected to product pages, formal specifications or Product Schema."
  };
  for (const [field, result] of fieldResults) output[field] = result.value;
  return output;
});

const candidateOnlyFieldCount = candidateOptionRows.filter((row) => !["accepted", "no-source"].includes(row.candidate_basis)).length;
const unresolvedCandidateFieldCount = candidateOptionRows.filter((row) => row.candidate_basis === "no-source").length;
const conflictCandidateFieldCount = candidateOptionRows.filter((row) => ["conflict-options", "ambiguous-candidate"].includes(row.candidate_basis)).length;

fs.mkdirSync(path.dirname(pageCatalogPath), { recursive: true });
fs.mkdirSync(path.dirname(mappingPath), { recursive: true });
fs.mkdirSync(path.dirname(auditCsvPath), { recursive: true });
fs.writeFileSync(pageCatalogPath, serializeCsv(PAGE_HEADERS, pageRows), "utf8");
fs.writeFileSync(mappingPath, serializeCsv(PRODUCT_SOURCE_MAPPING_HEADERS, mappings), "utf8");
fs.writeFileSync(sourcePath, serializeCsv(PRODUCT_SPECIFICATION_SOURCE_HEADERS, sourceRecords), "utf8");
fs.writeFileSync(chinesePath, serializeCsv(CHINESE_SPECIFICATION_HEADERS, chineseRows), "utf8");
fs.writeFileSync(approvedBaselinePath, serializeCsv(SPECIFICATION_HEADERS, approvedBaseline), "utf8");
fs.writeFileSync(auditCsvPath, serializeCsv(AUDIT_HEADERS, auditRows), "utf8");
fs.writeFileSync(candidateFillPath, serializeCsv([...CANDIDATE_METADATA_HEADERS, ...SPECIFICATION_DATA_FIELDS], candidateFillRows), "utf8");
fs.writeFileSync(candidateOptionsPath, serializeCsv(CANDIDATE_OPTION_HEADERS, candidateOptionRows), "utf8");

const candidateMarkdown = [
  "# Internal Product Specification Candidate Fill",
  "",
  "> Internal review only. This report is not connected to product pages, the formal specification master or Product Schema.",
  "",
  `- Products: ${products.length}`,
  `- Applicable product-field rows: ${candidateOptionRows.length}`,
  `- Formal accepted fields copied for context: ${candidateOptionRows.filter((row) => row.candidate_basis === "accepted").length}`,
  `- Candidate-only fields populated: ${candidateOnlyFieldCount}`,
  `- Conflict or ambiguous candidate fields: ${conflictCandidateFieldCount}`,
  `- Fields with no source value remaining TBD: ${unresolvedCandidateFieldCount}`,
  "",
  "Candidate notation:",
  "",
  "- `CONFLICT: value A || value B` keeps every conflicting source option.",
  "- `CANDIDATE: value` is a partial, category-level, failed-detail or otherwise ambiguous reference.",
  "- `TBD` means no source value was available.",
  "",
  "| SKU | Product | Match | Candidate fields | Candidate-only | Conflict/ambiguous | No-source TBD |",
  "| --- | --- | --- | ---: | ---: | ---: | ---: |",
  ...candidateFillRows.map((row) => `| ${row.sku} | ${row.product_name} | ${row.match_type}/${row.match_confidence} | ${row.candidate_field_count} | ${row.candidate_only_field_count} | ${row.conflict_field_count} | ${row.unresolved_tbd_count} |`),
  ""
].join("\n");
fs.writeFileSync(candidateMarkdownPath, candidateMarkdown, "utf8");

const matchCounts = new Map<string, number>();
for (const mapping of mappings) matchCounts.set(mapping.match_type, (matchCounts.get(mapping.match_type) ?? 0) + 1);
const acceptedFieldCount = sourceRecords.filter((record) => record.use_status === "accepted").length;
const conflictedFieldCount = [...conflictedBySku.values()].reduce((sum, fields) => sum + fields.length, 0);
const tbdFieldCount = plannedSpecifications.reduce((sum, record) => sum + SPECIFICATION_DATA_FIELDS.filter((field) => isTbd(record[field])).length, 0);
const failedPages = curation.pages.filter((page) => page.page_status === "failed").length;
const productPages = curation.pages.filter((page) => !["category", "company"].includes(page.source_category)).length;

const auditMarkdown = [
  "# Product Specification Source Audit",
  "",
  `- Product rows: ${products.length}`,
  `- Discovered product/showroom pages: ${productPages}`,
  `- Successfully read catalog pages: ${curation.pages.length - failedPages}`,
  `- Failed catalog pages: ${failedPages}`,
  `- Duplicate main/mobile evidence pages: 0`,
  `- Exact matches: ${matchCounts.get("exact") ?? 0}`,
  `- Strong matches: ${matchCounts.get("strong") ?? 0}`,
  `- Partial matches: ${matchCounts.get("partial") ?? 0}`,
  `- No match: ${matchCounts.get("none") ?? 0}`,
  `- Accepted field values: ${acceptedFieldCount}`,
  `- Conflicted fields: ${conflictedFieldCount}`,
  `- Fields remaining TBD: ${tbdFieldCount}`,
  `- Company-level values rejected: ${curation.company_rejections.length}`,
  `- Products requiring manual review: ${products.length}`,
  "",
  "| SKU | Product | Category | Match | Confidence | Accepted fields | Conflict fields | Status | Recommended action |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...auditRows.map((row) => `| ${row.sku} | ${row.product_name} | ${row.category} | ${row.match_type} | ${row.match_confidence} | ${row.fields_extracted || "None"} | ${row.fields_conflicted || "None"} | ${row.verification_status} | ${row.recommended_action.replace(/\|/g, "\\|")} |`),
  "",
  "## Company-level values rejected",
  "",
  ...curation.company_rejections.map((item) => `- ${item.field_name}: ${item.extracted_value} — ${item.notes}`),
  ""
].join("\n");
fs.writeFileSync(auditMarkdownPath, auditMarkdown, "utf8");

const reviewProducts = plannedSpecifications.map((record) => {
  const mapping = mappingsBySku.get(record.sku) as ProductSourceMappingRecord;
  const records = sourceRecords.filter((source) => source.sku === record.sku);
  const accepted = records.filter((source) => source.use_status === "accepted");
  const conflicts = records.filter((source) => source.conflict_status !== "none");
  const approximate = records.filter((source) => /\b(?:about|approximate|approximately)\b/i.test(`${source.source_text} ${source.notes}`));
  return {
    sku: record.sku,
    productName: record.product_name,
    slug: record.product_slug,
    category: mapping.category,
    sourceUrl: mapping.source_url,
    secondarySourceUrl: mapping.secondary_source_url,
    sourceProductName: mapping.source_product_name,
    matchType: mapping.match_type,
    confidence: mapping.match_confidence,
    matchReason: mapping.match_reason,
    verificationStatus: record.verification_status,
    accepted: accepted.map((source) => ({ field: source.field_name, value: source.normalized_value, sourceText: source.source_text })),
    candidateValues: SPECIFICATION_DATA_FIELDS.map((field) => ({ field, ...candidateField(record, field) }))
      .filter((item) => !["accepted", "no-source"].includes(item.basis))
      .map((item) => ({ field: item.field, value: item.value, basis: item.basis, sourceText: unique(item.records.map((source) => source.source_text)).join(" || ") })),
    tbd: SPECIFICATION_DATA_FIELDS.filter((field) => isTbd(record[field])),
    conflicts: conflicts.map((source) => ({ field: source.field_name, value: source.extracted_value, status: source.conflict_status, sourceText: source.source_text })),
    approximate: approximate.map((source) => ({ field: source.field_name, sourceText: source.source_text })),
    sourceTexts: unique(records.map((source) => source.source_text)),
    manualReview: true
  };
});
const reviewJson = JSON.stringify(reviewProducts).replace(/<\/script/gi, "<\\/script");
const categoryOptions = unique(mappings.map((mapping) => mapping.category));
const reviewHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Gaoshuo 产品参数来源审核</title>
  <style>
    :root{color-scheme:light;font-family:Arial,"Microsoft YaHei",sans-serif;color:#1c252b;background:#eef1f3}body{margin:0}.wrap{max-width:1440px;margin:auto;padding:24px}.hero{background:#17242c;color:#fff;padding:24px;border-radius:12px}.hero h1{margin:0 0 8px}.filters{display:grid;grid-template-columns:repeat(3,minmax(180px,1fr));gap:12px;margin:18px 0}.filters label{font-weight:700}.filters select{width:100%;margin-top:6px;padding:10px;border:1px solid #aeb8be;border-radius:6px;background:#fff}.summary{margin:12px 0;font-weight:700}.card{background:#fff;border:1px solid #c9d1d6;border-radius:10px;margin:16px 0;padding:20px;box-shadow:0 2px 8px #1d2a3312}.card h2{margin:0}.meta{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:10px;margin:14px 0}.meta div{background:#f3f5f6;padding:10px;border-radius:6px}.tag{display:inline-block;padding:4px 8px;margin:3px;border-radius:999px;background:#dfe8ed;font-size:12px;font-weight:700}.conflict{background:#ffe0dc;color:#982d20}.candidate{background:#fff0c9;color:#7d5800}.approximate{background:#fff0c9;color:#7d5800}.manual{background:#f4ddff;color:#6d2784}.company{background:#dbe7ff;color:#204d91}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.panel{border:1px solid #d9dfe2;border-radius:8px;padding:14px}.candidate-panel{grid-column:1/-1;background:#fffaf0;border-color:#e4bd62}.panel h3{margin-top:0}.field{padding:8px 0;border-bottom:1px solid #edf0f2}.field:last-child{border-bottom:0}.source{color:#44545e;font-size:13px;margin-top:4px;line-height:1.45}a{color:#0a5aa8;word-break:break-all}.empty{color:#71808a}.company-note{background:#dbe7ff;border-left:4px solid #2466b0;padding:12px;margin-top:14px}@media(max-width:900px){.filters,.meta,.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main class="wrap">
    <header class="hero"><h1>Gaoshuo 产品技术参数来源审核</h1><p>只读内部审核页 · 共 ${products.length} 个 published 产品 · 生成日期 ${checkedAt}</p><div class="company-note"><span class="tag company">company-capability-only</span> ${curation.company_rejections.length} 项企业级能力/认证已拒绝写入具体 SKU。</div><div class="company-note"><span class="tag candidate">candidate-only</span> 内部候选值不会写入正式参数表、产品前台或 Product Schema。</div></header>
    <section class="filters" aria-label="筛选">
      <label>分类<select id="category"><option value="">全部分类</option>${categoryOptions.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}</select></label>
      <label>匹配置信度<select id="confidence"><option value="">全部置信度</option><option>high</option><option>medium</option><option>low</option></select></label>
      <label>冲突<select id="conflict"><option value="">全部</option><option value="yes">有冲突</option><option value="no">无冲突</option></select></label>
    </section>
    <div id="summary" class="summary"></div><div id="cards"></div>
  </main>
  <script>const products=${reviewJson};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const link=(url,label)=>url?'<a href="'+esc(url)+'" target="_blank" rel="noreferrer">'+esc(label||url)+'</a>':'<span class="empty">未找到</span>';
  function render(){const category=document.querySelector('#category').value,confidence=document.querySelector('#confidence').value,conflict=document.querySelector('#conflict').value;const rows=products.filter(p=>(!category||p.category===category)&&(!confidence||p.confidence===confidence)&&(!conflict||(conflict==='yes')===(p.conflicts.length>0)));document.querySelector('#summary').textContent='当前显示 '+rows.length+' / '+products.length+' 个产品';document.querySelector('#cards').innerHTML=rows.map(p=>'<article class="card"><h2>'+esc(p.sku)+' · '+esc(p.productName)+'</h2><div><span class="tag">'+esc(p.matchType)+'</span><span class="tag">'+esc(p.confidence)+'</span>'+(p.conflicts.length?'<span class="tag conflict">conflict</span>':'')+(p.approximate.length?'<span class="tag approximate">approximate</span>':'')+'<span class="tag manual">manual review required</span></div><div class="meta"><div><strong>Slug</strong><br>'+esc(p.slug)+'</div><div><strong>Category</strong><br>'+esc(p.category)+'</div><div><strong>Verification</strong><br>'+esc(p.verificationStatus)+'</div><div><strong>Source product</strong><br>'+esc(p.sourceProductName||'TBD')+'</div></div><p><strong>匹配理由：</strong>'+esc(p.matchReason)+'</p><p><strong>主要来源：</strong>'+link(p.sourceUrl,p.sourceUrl)+'</p>'+(p.secondarySourceUrl?'<p><strong>次要来源：</strong>'+link(p.secondarySourceUrl,p.secondarySourceUrl)+'</p>':'')+'<div class="grid"><section class="panel candidate-panel"><h3>内部候选填充（不用于前台）</h3>'+(p.candidateValues.length?p.candidateValues.map(x=>'<div class="field"><span class="tag candidate">'+esc(x.basis)+'</span> <strong>'+esc(x.field)+'</strong>: '+esc(x.value)+'<div class="source">'+esc(x.sourceText)+'</div></div>').join(''):'<p class="empty">无额外候选值</p>')+'</section><section class="panel"><h3>已提取字段</h3>'+(p.accepted.length?p.accepted.map(x=>'<div class="field"><strong>'+esc(x.field)+'</strong>: '+esc(x.value)+'<div class="source">'+esc(x.sourceText)+'</div></div>').join(''):'<p class="empty">无已接受字段</p>')+'</section><section class="panel"><h3>TBD 字段</h3><p>'+esc(p.tbd.join('; ')||'None')+'</p></section><section class="panel"><h3>冲突字段</h3>'+(p.conflicts.length?p.conflicts.map(x=>'<div class="field"><span class="tag conflict">'+esc(x.status)+'</span> <strong>'+esc(x.field)+'</strong>: '+esc(x.value)+'<div class="source">'+esc(x.sourceText)+'</div></div>').join(''):'<p class="empty">无冲突字段</p>')+'</section><section class="panel"><h3>原始来源文本</h3>'+(p.sourceTexts.length?p.sourceTexts.map(x=>'<p class="source">'+esc(x)+'</p>').join(''):'<p class="empty">无可用原始文本</p>')+'</section></div></article>').join('')||'<p class="empty">没有符合筛选条件的产品。</p>'}document.querySelectorAll('select').forEach(el=>el.addEventListener('change',render));render();</script>
</body>
</html>`;
fs.writeFileSync(reviewHtmlPath, reviewHtml, "utf8");

console.log(`Generated source catalog (${curation.pages.length} pages), mappings (${mappings.length}), evidence (${sourceRecords.length}), candidate rows (${candidateOptionRows.length}) and review reports.`);
