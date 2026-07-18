import fs from "node:fs";
import path from "node:path";
import { parseCsvRecords, serializeCsv, type CsvRecord } from "../src/lib/csv";
import { getAllProducts } from "../src/lib/products/data";
import {
  CHINESE_HEADER_MAP,
  CHINESE_SPECIFICATION_HEADERS,
  SPECIFICATION_HEADERS,
  type SpecificationRecord
} from "../src/lib/products/specification-model";
import { readProductSpecifications } from "../src/lib/products/specifications";

const root = process.cwd();
const sourcePath = path.join(root, "data", "product-specifications-zh.csv");
const targetPath = path.join(root, "data", "product-specifications.csv");
const reportCsvPath = path.join(root, "reports", "product-specification-sync.csv");
const reportMarkdownPath = path.join(root, "reports", "product-specification-sync.md");
const force = process.argv.includes("--force");

type SyncResult = {
  sku: string;
  action: "synced" | "unchanged" | "skipped" | "error";
  verification_status: string;
  message: string;
};

const statusAliases: Record<string, string> = {
  unverified: "unverified",
  incomplete: "incomplete",
  reviewed: "reviewed",
  approved: "approved",
  rejected: "rejected",
  "未验证": "unverified",
  "不完整": "incomplete",
  "已审核": "reviewed",
  "已批准": "approved",
  "已拒绝": "rejected"
};

function normalizeStatus(value: string): string {
  return statusAliases[value.trim()] ?? value.trim();
}

function safeProductionNotes(status: string): string {
  if (status === "incomplete") return "Source-backed fields are incomplete and require manual confirmation. Evidence and conflicts are recorded in internal audit files.";
  if (status === "unverified") return "No sufficiently matched product-page evidence was accepted. Applicable fields remain to be confirmed.";
  if (status === "rejected") return "This specification record is not approved for publication.";
  return "Specifications require human review and final configuration confirmation.";
}

function writeReport(results: SyncResult[]): void {
  fs.mkdirSync(path.dirname(reportCsvPath), { recursive: true });
  const reportRows: CsvRecord[] = results.map((result) => ({ ...result }));
  fs.writeFileSync(reportCsvPath, serializeCsv(["sku", "action", "verification_status", "message"], reportRows), "utf8");

  const counts = new Map<string, number>();
  for (const result of results) counts.set(result.action, (counts.get(result.action) ?? 0) + 1);
  const markdown = [
    "# Product Specification Sync Report",
    "",
    `- Force mode: ${force ? "yes" : "no"}`,
    `- Synced: ${counts.get("synced") ?? 0}`,
    `- Unchanged: ${counts.get("unchanged") ?? 0}`,
    `- Skipped: ${counts.get("skipped") ?? 0}`,
    `- Errors: ${counts.get("error") ?? 0}`,
    "",
    "| SKU | Action | Status | Message |",
    "| --- | --- | --- | --- |",
    ...results.map((result) => `| ${result.sku || "-"} | ${result.action} | ${result.verification_status || "-"} | ${result.message.replace(/\|/g, "\\|")} |`),
    ""
  ].join("\n");
  fs.writeFileSync(reportMarkdownPath, markdown, "utf8");
}

if (!fs.existsSync(sourcePath)) {
  writeReport([{ sku: "", action: "error", verification_status: "", message: "Chinese specification template does not exist." }]);
  console.error(`Missing source file: ${sourcePath}`);
  process.exit(1);
}

const source = parseCsvRecords(fs.readFileSync(sourcePath, "utf8"));
const headerMismatch = source.headers.length !== CHINESE_SPECIFICATION_HEADERS.length || source.headers.some((header, index) => header !== CHINESE_SPECIFICATION_HEADERS[index]);
if (headerMismatch) {
  writeReport([{ sku: "", action: "error", verification_status: "", message: "Chinese template headers do not match the required order." }]);
  console.error("Chinese template headers do not match the required order.");
  process.exit(1);
}

const duplicateSkus = [...new Set(source.records.map((record) => record.SKU.trim()).filter((sku, index, values) => sku && values.indexOf(sku) !== index))];
if (duplicateSkus.length > 0) {
  writeReport(duplicateSkus.map((sku) => ({ sku, action: "error", verification_status: "", message: "Duplicate SKU in Chinese template." })));
  console.error(`Duplicate SKU in Chinese template: ${duplicateSkus.join(", ")}`);
  process.exit(1);
}

const products = getAllProducts().filter((product) => product.status === "published" && product.publishableBoolean);
const productsBySku = new Map(products.map((product) => [product.sku, product]));
const existing = readProductSpecifications(targetPath).specifications;
const existingBySku = new Map(existing.map((record) => [record.sku, record]));
const sourceBySku = new Map(source.records.map((record) => [record.SKU.trim(), record]));
const output: SpecificationRecord[] = [];
const results: SyncResult[] = [];

for (const sourceRecord of source.records) {
  const sku = sourceRecord.SKU.trim();
  if (!sku) {
    results.push({ sku: "", action: "error", verification_status: "", message: "Empty SKU; row was not synchronized." });
    continue;
  }
  if (!productsBySku.has(sku)) {
    results.push({ sku, action: "error", verification_status: sourceRecord[CHINESE_HEADER_MAP.verification_status] ?? "", message: "SKU does not exist in the published product library; row was not synchronized." });
  }
}

for (const product of products) {
  const sourceRecord = sourceBySku.get(product.sku);
  const current = existingBySku.get(product.sku);
  if (!sourceRecord) {
    results.push({ sku: product.sku, action: "error", verification_status: current?.verification_status ?? "", message: "Published SKU is missing from the Chinese template." });
    if (current) output.push(current);
    continue;
  }

  if (sourceRecord[CHINESE_HEADER_MAP.product_slug] !== product.slug || sourceRecord[CHINESE_HEADER_MAP.product_name] !== product.product_name) {
    results.push({ sku: product.sku, action: "error", verification_status: sourceRecord[CHINESE_HEADER_MAP.verification_status] ?? "", message: "Product slug or product name does not match data/products.csv; row was not synchronized." });
    if (current) output.push(current);
    continue;
  }

  if (current?.verification_status === "approved" && !force) {
    output.push(current);
    results.push({ sku: product.sku, action: "skipped", verification_status: current.verification_status, message: "Existing approved data was preserved. Use specs:sync:force only after explicit approval." });
    continue;
  }

  const mapped = Object.fromEntries(
    SPECIFICATION_HEADERS.map((field) => [field, sourceRecord[CHINESE_HEADER_MAP[field]] ?? ""])
  ) as SpecificationRecord;
  mapped.sku = product.sku;
  mapped.product_slug = product.slug;
  mapped.product_name = product.product_name;
  mapped.verification_status = normalizeStatus(mapped.verification_status);
  mapped.notes = safeProductionNotes(mapped.verification_status);

  if (["reviewed", "approved"].includes(mapped.verification_status) && current?.verification_status !== mapped.verification_status && !force) {
    if (current) output.push(current);
    results.push({
      sku: product.sku,
      action: "error",
      verification_status: mapped.verification_status,
      message: "Automatic escalation to reviewed or approved is blocked. Preserve the current record or use an explicitly authorized review workflow."
    });
    continue;
  }
  output.push(mapped);

  const before = current ? JSON.stringify(current) : "";
  const after = JSON.stringify(mapped);
  results.push({
    sku: product.sku,
    action: before === after ? "unchanged" : "synced",
    verification_status: mapped.verification_status,
    message: before === after ? "No changes detected." : "Chinese template values synchronized with status normalization; no automatic review or approval was applied."
  });
}

fs.writeFileSync(targetPath, serializeCsv(SPECIFICATION_HEADERS, output), "utf8");
writeReport(results);

const errorCount = results.filter((result) => result.action === "error").length;
console.log(`Synchronized ${results.filter((result) => result.action === "synced").length} product specification row(s); ${errorCount} error(s).`);
if (errorCount > 0) process.exit(1);
