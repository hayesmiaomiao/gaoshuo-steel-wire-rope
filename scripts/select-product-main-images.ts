import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const importRoot = path.join(projectRoot, "image-import");
const productsPath = path.join(projectRoot, "data", "products.csv");
const reportCsvPath = path.join(projectRoot, "reports", "product-main-image-selection.csv");
const reportHtmlPath = path.join(projectRoot, "reports", "product-main-image-review.html");
const historyPath = path.join(projectRoot, "reports", "product-main-image-history.csv");

const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp", ".avif"]);
const normalizedPattern = /^(main|detail|terminal|construction|application|packaging|drawing|review)-original-(\d{2,})\.(jpg|jpeg|png|webp|tif|tiff|bmp|avif)$/i;
const selectableTypes = new Set(["main", "detail", "terminal", "construction", "review", "application"]);

const selectionHeaders = [
  "sku",
  "product_slug",
  "product_name",
  "category",
  "candidate_count",
  "selected_source_file",
  "selected_main_file",
  "selected_type",
  "width",
  "height",
  "file_size_bytes",
  "aspect_ratio",
  "score",
  "selection_reason",
  "needs_manual_review",
  "status",
  "notes"
] as const;

const historyHeaders = ["batch_id", "executed_at", "product_slug", "source_file", "created_main_file", "result", "error_message"] as const;

type CsvRecord = Record<string, string>;

type ProductRow = CsvRecord & {
  sku: string;
  slug: string;
  product_name: string;
  category: string;
  status: string;
  publishable: string;
};

type CandidateType = "main" | "detail" | "terminal" | "construction" | "review" | "application";
type SelectionStatus = "selected" | "existing" | "review" | "conflict" | "failed";

type Candidate = {
  productSlug: string;
  absolutePath: string;
  relativePath: string;
  fileName: string;
  extension: string;
  type: CandidateType;
  width: number;
  height: number;
  size: number;
  aspectRatio: number;
  score: number;
  reason: string;
  readable: boolean;
  error: string;
};

type SelectionRow = {
  sku: string;
  product_slug: string;
  product_name: string;
  category: string;
  candidate_count: string;
  selected_source_file: string;
  selected_main_file: string;
  selected_type: string;
  width: string;
  height: string;
  file_size_bytes: string;
  aspect_ratio: string;
  score: string;
  selection_reason: string;
  needs_manual_review: string;
  status: SelectionStatus;
  notes: string;
};

type HistoryRow = {
  batch_id: string;
  executed_at: string;
  product_slug: string;
  source_file: string;
  created_main_file: string;
  result: string;
  error_message: string;
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];
    if (character === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  values.push(current);
  return values;
}

function readCsv(filePath: string): { headers: string[]; rows: CsvRecord[] } {
  if (!fs.existsSync(filePath)) return { headers: [], rows: [] };
  const lines = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0] ?? "");
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
  return { headers, rows };
}

function csvCell(value: string | number | boolean): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath: string, headers: readonly string[], rows: CsvRecord[]): void {
  const lines = [csvCell(headers[0]) + headers.slice(1).map((header) => `,${csvCell(header)}`).join("")];
  for (const row of rows) lines.push(headers.map((header) => csvCell(row[header] ?? "")).join(","));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function writeSelections(rows: SelectionRow[]): void {
  writeCsv(reportCsvPath, selectionHeaders, rows);
}

function ensureHistory(): void {
  if (!fs.existsSync(historyPath)) writeCsv(historyPath, historyHeaders, []);
}

function appendHistory(rows: HistoryRow[]): void {
  ensureHistory();
  if (rows.length === 0) return;
  const lines = rows.map((row) => historyHeaders.map((header) => csvCell(row[header])).join(","));
  fs.appendFileSync(historyPath, `${lines.join("\n")}\n`, "utf8");
}

function toPosix(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

function projectRelative(absolutePath: string): string {
  return toPosix(path.relative(projectRoot, absolutePath));
}

function sha256(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function generateBatchId(): string {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return `${timestamp}-${crypto.randomBytes(3).toString("hex")}`;
}

function candidateType(fileName: string): CandidateType | undefined {
  const match = normalizedPattern.exec(fileName);
  if (!match) return "review";
  const type = match[1].toLowerCase();
  return selectableTypes.has(type) ? (type as CandidateType) : undefined;
}

function scoreCandidate(type: CandidateType, width: number, height: number, size: number): { score: number; reason: string; aspectRatio: number } {
  let score = 10;
  const reasons = ["readable +10"];
  const shortest = Math.min(width, height);
  if (shortest >= 1000) {
    score += 30;
    reasons.push("short edge >=1000px +30");
  } else if (shortest >= 800) {
    score += 20;
    reasons.push("short edge 800-999px +20");
  } else if (shortest >= 600) {
    score += 10;
    reasons.push("short edge 600-799px +10");
  } else {
    score -= 20;
    reasons.push("short edge <600px -20");
  }

  const aspectRatio = Math.max(width, height) / Math.min(width, height);
  if (Math.abs(aspectRatio - 1) <= 0.1) {
    score += 20;
    reasons.push("near 1:1 +20");
  } else if (Math.min(Math.abs(aspectRatio - 4 / 3), Math.abs(aspectRatio - 3 / 2)) <= 0.15) {
    score += 15;
    reasons.push("near 4:3 or 3:2 +15");
  } else if (aspectRatio >= 2.5) {
    score -= 15;
    reasons.push("extreme aspect ratio -15");
  }

  const typeScores: Record<CandidateType, number> = {
    main: 40,
    detail: 25,
    terminal: 20,
    construction: 15,
    review: 10,
    application: 5
  };
  score += typeScores[type];
  reasons.push(`${type} +${typeScores[type]}`);
  if (size > 30 * 1024) {
    score += 5;
    reasons.push("file >30KB +5");
  } else if (size < 10 * 1024) {
    score -= 20;
    reasons.push("file <10KB -20");
  }
  return { score, reason: reasons.join("; "), aspectRatio };
}

async function inspectCandidate(productSlug: string, absolutePath: string): Promise<Candidate | undefined> {
  const fileName = path.basename(absolutePath);
  const type = candidateType(fileName);
  if (!type) return undefined;
  const stat = fs.statSync(absolutePath);
  const extension = path.extname(fileName).toLowerCase();
  if (stat.size === 0) {
    return { productSlug, absolutePath, relativePath: projectRelative(absolutePath), fileName, extension, type, width: 0, height: 0, size: 0, aspectRatio: 0, score: Number.NEGATIVE_INFINITY, reason: "Zero-byte image excluded.", readable: false, error: "Zero-byte image." };
  }
  try {
    const metadata = await sharp(absolutePath, { failOn: "error" }).metadata();
    let width = metadata.width ?? 0;
    let height = metadata.height ?? 0;
    if (metadata.orientation && metadata.orientation >= 5 && metadata.orientation <= 8) [width, height] = [height, width];
    if (width <= 0 || height <= 0) throw new Error("Image dimensions are unavailable.");
    const scoring = scoreCandidate(type, width, height, stat.size);
    return { productSlug, absolutePath, relativePath: projectRelative(absolutePath), fileName, extension, type, width, height, size: stat.size, aspectRatio: scoring.aspectRatio, score: scoring.score, reason: scoring.reason, readable: true, error: "" };
  } catch (error) {
    return { productSlug, absolutePath, relativePath: projectRelative(absolutePath), fileName, extension, type, width: 0, height: 0, size: stat.size, aspectRatio: 0, score: Number.NEGATIVE_INFINITY, reason: "Unreadable image excluded.", readable: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function productCandidates(product: ProductRow): Promise<Candidate[]> {
  const directory = path.join(importRoot, product.category, product.slug);
  if (!fs.existsSync(directory)) return [];
  const candidates: Candidate[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !supportedExtensions.has(path.extname(entry.name).toLowerCase())) continue;
    const candidate = await inspectCandidate(product.slug, path.join(directory, entry.name));
    if (candidate) candidates.push(candidate);
  }
  return candidates;
}

function sortCandidates(candidates: Candidate[]): Candidate[] {
  return [...candidates].sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    const areaDifference = right.width * right.height - left.width * left.height;
    if (areaDifference !== 0) return areaDifference;
    return left.fileName.localeCompare(right.fileName);
  });
}

async function createPlan(): Promise<{ rows: SelectionRow[]; candidates: Map<string, Candidate[]>; seriousErrors: string[]; batchId: string }> {
  const productsCsv = readCsv(productsPath);
  const products = (productsCsv.rows as ProductRow[]).filter((product) => product.status === "published" && product.publishable.toLowerCase() === "true");
  const rows: SelectionRow[] = [];
  const candidatesByProduct = new Map<string, Candidate[]>();
  const seriousErrors: string[] = [];
  const batchId = generateBatchId();
  const activeHistoryByProduct = new Map(activeCreatedHistory().map((row) => [row.product_slug, row]));

  for (const product of products) {
    const candidates = sortCandidates(await productCandidates(product));
    candidatesByProduct.set(product.slug, candidates);
    const readable = candidates.filter((candidate) => candidate.readable);
    const existingMains = readable.filter((candidate) => candidate.type === "main" && /^main-original-01\./i.test(candidate.fileName));
    const notes: string[] = [];
    let selected: Candidate | undefined;
    let status: SelectionStatus;
    let needsManualReview = false;

    if (existingMains.length > 1) {
      status = "conflict";
      notes.push("Multiple main-original-01 files with different extensions exist; product processing is stopped.");
      seriousErrors.push(`${product.slug}: multiple main-original-01 files.`);
    } else if (existingMains.length === 1) {
      const historySource = activeHistoryByProduct.get(product.slug)?.source_file;
      selected = candidates.find((candidate) => candidate.relativePath === historySource) ?? existingMains[0];
      needsManualReview = selected.type === "review";
      status = "existing";
      notes.push("Existing main-original-01 is kept without overwrite.");
    } else if (readable.length === 0) {
      status = "failed";
      notes.push("No readable selectable image candidate exists.");
      seriousErrors.push(`${product.slug}: no readable main image candidate.`);
    } else {
      selected = readable[0];
      needsManualReview = selected.type === "review";
      status = selected.type === "review" ? "review" : "selected";
      const tied = readable.filter((candidate) => candidate.score === selected?.score);
      if (tied.length > 1) notes.push(`${tied.length} candidates share the top score; pixel area and filename were used as deterministic tie-breakers.`);
    }
    if (candidates.some((candidate) => /\s/u.test(candidate.fileName) && !normalizedPattern.test(candidate.fileName))) notes.push("An abnormal filename with whitespace will be safely normalized to the next review-original number during execution.");

    const mainFile = selected ? projectRelative(path.join(importRoot, product.category, product.slug, `main-original-01${selected.extension}`)) : "";
    rows.push({
      sku: product.sku,
      product_slug: product.slug,
      product_name: product.product_name,
      category: product.category,
      candidate_count: String(readable.length),
      selected_source_file: selected?.relativePath ?? "",
      selected_main_file: mainFile,
      selected_type: selected?.type ?? "",
      width: selected ? String(selected.width) : "",
      height: selected ? String(selected.height) : "",
      file_size_bytes: selected ? String(selected.size) : "",
      aspect_ratio: selected ? selected.aspectRatio.toFixed(3) : "",
      score: selected && Number.isFinite(selected.score) ? String(selected.score) : "",
      selection_reason: selected?.reason ?? "",
      needs_manual_review: String(needsManualReview),
      status,
      notes: notes.join(" ")
    });
  }
  return { rows, candidates: candidatesByProduct, seriousErrors, batchId };
}

function htmlEscape(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function localImageReference(relativePath: string): string {
  return `../${toPosix(relativePath).split("/").map(encodeURIComponent).join("/")}`;
}

function writeHtml(rows: SelectionRow[], candidates: Map<string, Candidate[]>): void {
  const cards = rows.map((row) => {
    const productCandidatesForHtml = candidates.get(row.product_slug) ?? [];
    const selectedSource = row.selected_source_file ? localImageReference(row.selected_source_file) : "";
    const thumbs = productCandidatesForHtml.map((candidate) => `
      <figure class="thumb ${candidate.relativePath === row.selected_source_file ? "selected" : ""}">
        <img src="${htmlEscape(localImageReference(candidate.relativePath))}" alt="${htmlEscape(candidate.fileName)}" loading="lazy">
        <figcaption>${htmlEscape(candidate.fileName)}<br>${candidate.width}×${candidate.height} · score ${Number.isFinite(candidate.score) ? candidate.score : "excluded"} · ${candidate.type}</figcaption>
      </figure>`).join("");
    return `
    <section class="card ${row.needs_manual_review === "true" ? "manual" : ""}">
      <header><div><h2>${htmlEscape(row.product_name)}</h2><p>${htmlEscape(row.sku)} · ${htmlEscape(row.product_slug)}</p></div><span class="status">${htmlEscape(row.status)}</span></header>
      ${row.needs_manual_review === "true" ? '<div class="warning">MANUAL REVIEW REQUIRED</div>' : ""}
      <div class="selection">
        ${selectedSource ? `<img src="${htmlEscape(selectedSource)}" alt="Selected main candidate for ${htmlEscape(row.product_name)}">` : '<div class="empty">No candidate</div>'}
        <dl><dt>Selected file</dt><dd>${htmlEscape(row.selected_source_file || "None")}</dd><dt>Target main</dt><dd>${htmlEscape(row.selected_main_file || "None")}</dd><dt>Dimensions</dt><dd>${htmlEscape(row.width)}×${htmlEscape(row.height)}</dd><dt>Score</dt><dd>${htmlEscape(row.score)}</dd><dt>Reason</dt><dd>${htmlEscape(row.selection_reason)}</dd></dl>
      </div>
      <h3>Other candidates</h3><div class="thumbs">${thumbs}</div>
    </section>`;
  }).join("\n");
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Product Main Image Review</title>
<style>body{margin:0;background:#f2f2ef;color:#171717;font:14px/1.5 Arial,sans-serif}main{max-width:1440px;margin:auto;padding:24px}.card{margin:0 0 24px;padding:20px;background:white;border:1px solid #d8d8d4}.card.manual{border:3px solid #c54d16}header{display:flex;justify-content:space-between;gap:20px;align-items:start}h1,h2,h3{margin:0 0 8px}p{margin:0;color:#555}.status{padding:5px 10px;background:#171717;color:white;text-transform:uppercase}.warning{margin:14px 0;padding:10px;background:#fff0e8;color:#8f2d08;font-weight:bold}.selection{display:grid;grid-template-columns:minmax(240px,420px) 1fr;gap:24px;margin:18px 0}.selection>img,.empty{width:100%;aspect-ratio:1;object-fit:contain;background:#f7f7f5;border:1px solid #ddd}.empty{display:grid;place-items:center}dl{display:grid;grid-template-columns:120px 1fr;gap:8px;margin:0}dt{font-weight:bold}dd{margin:0;overflow-wrap:anywhere}.thumbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}.thumb{margin:0;padding:8px;border:1px solid #ddd}.thumb.selected{border:3px solid #e8820c}.thumb img{width:100%;aspect-ratio:1;object-fit:contain;background:#f7f7f5}.thumb figcaption{margin-top:6px;overflow-wrap:anywhere;font-size:12px}@media(max-width:700px){.selection{grid-template-columns:1fr}dl{grid-template-columns:1fr}.thumbs{grid-template-columns:repeat(2,1fr)}}</style></head><body><main><h1>Gaoshuo Product Main Image Review</h1><p>Local-only review page. No remote resources are loaded.</p>${cards}</main></body></html>`;
  fs.writeFileSync(reportHtmlPath, html, "utf8");
}

function nextReviewName(directory: string, extension: string, startAt = 1): string {
  const occupied = new Set<number>();
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const match = /^review-original-(\d{2,})\./i.exec(entry.name);
    if (entry.isFile() && match) occupied.add(Number(match[1]));
  }
  let number = startAt;
  while (occupied.has(number)) number += 1;
  return `review-original-${String(number).padStart(2, "0")}${extension}`;
}

function repairAnomalousReviewNames(): Map<string, string> {
  const repaired = new Map<string, string>();
  const products = (readCsv(productsPath).rows as ProductRow[]).filter((product) => product.status === "published" && product.publishable.toLowerCase() === "true");
  for (const product of products) {
    const directory = path.join(importRoot, product.category, product.slug);
    if (!fs.existsSync(directory)) continue;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isFile() || !supportedExtensions.has(path.extname(entry.name).toLowerCase()) || !/\s/u.test(entry.name) || normalizedPattern.test(entry.name)) continue;
      const source = path.join(directory, entry.name);
      const preferredStart = product.slug === "weight-stack-cable-assembly" && entry.name.includes("334788") ? 4 : 1;
      const target = path.join(directory, nextReviewName(directory, path.extname(entry.name).toLowerCase(), preferredStart));
      if (fs.existsSync(target)) throw new Error(`Review filename target is occupied: ${projectRelative(target)}`);
      fs.renameSync(source, target);
      if (!fs.existsSync(target)) throw new Error(`Review filename repair failed: ${projectRelative(target)}`);
      repaired.set(projectRelative(source), target);
    }
  }
  return repaired;
}

async function executeSelection(): Promise<{ rows: SelectionRow[]; candidates: Map<string, Candidate[]>; seriousErrors: string[]; batchId: string }> {
  const currentPlan = readCsv(reportCsvPath).rows as SelectionRow[];
  if (currentPlan.length === 0) throw new Error("Main image selection plan is missing. Run images:main:plan first.");
  const batchId = generateBatchId();
  const seriousErrors: string[] = [];
  const history: HistoryRow[] = [];

  if (currentPlan.some((row) => row.status === "conflict" || row.status === "failed")) {
    return { rows: currentPlan, candidates: new Map(), seriousErrors: ["Selection plan contains conflict or failed products."], batchId };
  }
  const repairedNames = repairAnomalousReviewNames();
  for (const row of currentPlan.filter((candidate) => candidate.status === "selected" || candidate.status === "review")) {
    const source = repairedNames.get(row.selected_source_file) ?? path.resolve(projectRoot, row.selected_source_file);
    let target = path.resolve(projectRoot, row.selected_main_file);
    let result = "created";
    let errorMessage = "";
    try {
      if (!source.startsWith(`${importRoot}${path.sep}`) || !target.startsWith(`${importRoot}${path.sep}`)) throw new Error("Unsafe source or target path.");
      if (!fs.existsSync(source)) throw new Error("Selected source file is missing.");
      if (fs.existsSync(target)) throw new Error("main-original-01 target is already occupied.");
      if (repairedNames.has(row.selected_source_file)) {
        row.selected_source_file = projectRelative(source);
        row.notes = `${row.notes} Selected source filename was safely normalized before copying.`.trim();
      }
      target = path.join(path.dirname(source), `main-original-01${path.extname(source).toLowerCase()}`);
      row.selected_main_file = projectRelative(target);
      if (fs.existsSync(target)) throw new Error("main-original-01 target became occupied.");
      fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
      if (!fs.existsSync(target) || sha256(source) !== sha256(target)) throw new Error("Copied main file failed hash verification.");
      row.status = "existing";
    } catch (error) {
      result = "failed";
      errorMessage = error instanceof Error ? error.message : String(error);
      row.status = "failed";
      row.notes = `${row.notes} ${errorMessage}`.trim();
      seriousErrors.push(`${row.product_slug}: ${errorMessage}`);
    }
    history.push({ batch_id: batchId, executed_at: new Date().toISOString(), product_slug: row.product_slug, source_file: projectRelative(source), created_main_file: projectRelative(target), result, error_message: errorMessage });
  }
  appendHistory(history);
  writeSelections(currentPlan);
  const refreshed = await createPlan();
  writeHtml(currentPlan, refreshed.candidates);
  return { rows: currentPlan, candidates: refreshed.candidates, seriousErrors, batchId };
}

function activeCreatedHistory(): HistoryRow[] {
  const history = readCsv(historyPath).rows as HistoryRow[];
  const key = (row: HistoryRow) => `${row.batch_id}\u0000${row.created_main_file}`;
  const rolledBack = new Set(history.filter((row) => row.result === "rolled-back").map(key));
  return history.filter((row) => row.result === "created" && !rolledBack.has(key(row)));
}

async function rollbackLatest(): Promise<{ seriousErrors: string[]; batchId: string }> {
  const active = activeCreatedHistory();
  const batchId = active.at(-1)?.batch_id;
  if (!batchId) throw new Error("No active main image selection batch is available to roll back.");
  const rows = active.filter((row) => row.batch_id === batchId).reverse();
  const seriousErrors: string[] = [];
  const history: HistoryRow[] = [];
  for (const row of rows) {
    const source = path.resolve(projectRoot, row.source_file);
    const created = path.resolve(projectRoot, row.created_main_file);
    let result = "rolled-back";
    let errorMessage = "";
    try {
      if (!source.startsWith(`${importRoot}${path.sep}`) || !created.startsWith(`${importRoot}${path.sep}`)) throw new Error("Unsafe history path.");
      if (!fs.existsSync(created)) throw new Error("Created main file is missing.");
      if (!fs.existsSync(source) || sha256(source) !== sha256(created)) throw new Error("Created main file no longer matches its original source; manual review required.");
      fs.rmSync(created);
    } catch (error) {
      result = "rollback-failed";
      errorMessage = error instanceof Error ? error.message : String(error);
      seriousErrors.push(`${row.product_slug}: ${errorMessage}`);
    }
    history.push({ ...row, executed_at: new Date().toISOString(), result, error_message: errorMessage });
  }
  appendHistory(history);
  return { seriousErrors, batchId };
}

function summarize(rows: SelectionRow[], seriousErrors: string[], operation: string): void {
  console.log(`Operation: ${operation}`);
  console.log(`Published products: ${rows.length}`);
  console.log(`Selected: ${rows.filter((row) => row.status === "selected").length}`);
  console.log(`Existing: ${rows.filter((row) => row.status === "existing").length}`);
  console.log(`Manual review: ${rows.filter((row) => row.needs_manual_review === "true").length}`);
  console.log(`Conflict: ${rows.filter((row) => row.status === "conflict").length}`);
  console.log(`Failed: ${rows.filter((row) => row.status === "failed").length}`);
  console.log(`Serious errors: ${seriousErrors.length}`);
  for (const error of seriousErrors) console.error(error);
  console.log(`Wrote ${projectRelative(reportCsvPath)}.`);
  console.log(`Wrote ${projectRelative(reportHtmlPath)}.`);
  console.log(`Wrote ${projectRelative(historyPath)}.`);
}

async function main(): Promise<void> {
  ensureHistory();
  const args = new Set(process.argv.slice(2));
  if (args.has("--execute")) {
    const result = await executeSelection();
    summarize(result.rows, result.seriousErrors, "execute");
    if (result.seriousErrors.length > 0) process.exitCode = 1;
    return;
  }
  if (args.has("--rollback-latest")) {
    const result = await rollbackLatest();
    const plan = await createPlan();
    writeSelections(plan.rows);
    writeHtml(plan.rows, plan.candidates);
    summarize(plan.rows, result.seriousErrors, `rollback ${result.batchId}`);
    if (result.seriousErrors.length > 0) process.exitCode = 1;
    return;
  }
  const result = await createPlan();
  writeSelections(result.rows);
  writeHtml(result.rows, result.candidates);
  summarize(result.rows, result.seriousErrors, "plan");
  if (result.seriousErrors.length > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
