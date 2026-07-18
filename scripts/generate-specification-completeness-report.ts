import fs from "node:fs";
import path from "node:path";
import { serializeCsv, type CsvRecord } from "../src/lib/csv";
import { createCompletenessRows } from "../src/lib/products/specification-completeness";
import { readProductSpecifications } from "../src/lib/products/specifications";

const root = process.cwd();
const reportCsvPath = path.join(root, "reports", "product-specification-completeness.csv");
const reportMarkdownPath = path.join(root, "reports", "product-specification-completeness.md");
const { specifications, errors } = readProductSpecifications();
if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const rows = createCompletenessRows(specifications);
const headers = ["sku", "product_name", "category", "total_applicable_fields", "confirmed_fields", "tbd_fields", "na_fields", "completion_percentage", "verification_status", "missing_critical_fields", "publish_risk", "recommended_action"];
fs.mkdirSync(path.dirname(reportCsvPath), { recursive: true });
fs.writeFileSync(reportCsvPath, serializeCsv(headers, rows as CsvRecord[]), "utf8");

const average = rows.length === 0 ? 0 : rows.reduce((sum, row) => sum + Number(row.completion_percentage), 0) / rows.length;
const statusCounts = new Map<string, number>();
for (const row of rows) statusCounts.set(row.verification_status, (statusCounts.get(row.verification_status) ?? 0) + 1);
const markdown = [
  "# Product Specification Completeness",
  "",
  `- Product rows: ${rows.length}`,
  `- Average completion: ${average.toFixed(1)}%`,
  `- Approved: ${statusCounts.get("approved") ?? 0}`,
  `- Reviewed: ${statusCounts.get("reviewed") ?? 0}`,
  `- Incomplete: ${statusCounts.get("incomplete") ?? 0}`,
  `- Unverified: ${statusCounts.get("unverified") ?? 0}`,
  "",
  "| SKU | Product | Category | Completion | Status | Risk | Missing critical fields |",
  "| --- | --- | --- | ---: | --- | --- | --- |",
  ...rows.map((row) => `| ${row.sku} | ${row.product_name} | ${row.category} | ${row.completion_percentage}% | ${row.verification_status} | ${row.publish_risk} | ${row.missing_critical_fields || "None"} |`),
  ""
].join("\n");
fs.writeFileSync(reportMarkdownPath, markdown, "utf8");
console.log(`Generated specification completeness report for ${rows.length} products; average completion ${average.toFixed(1)}%.`);
