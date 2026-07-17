import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const importRoot = path.join(projectRoot, "image-import");
const publicRoot = path.join(projectRoot, "public");
const productImagesRoot = path.join(publicRoot, "images", "products");
const productsPath = path.join(projectRoot, "data", "products.csv");
const mappingPath = path.join(projectRoot, "data", "product-images.csv");
const planPath = path.join(projectRoot, "reports", "product-image-processing-plan.csv");
const manifestPath = path.join(projectRoot, "reports", "product-image-processing-manifest.csv");

const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp", ".avif"]);
const approvedSourcePattern = /^(main|detail|terminal|construction|application|packaging|drawing|review)-original-(\d{2,})\.(jpg|jpeg|png|webp|tif|tiff|bmp|avif)$/i;
const mappingStatusesAllowedForProcessing = new Set(["ready", "missing"]);

const planHeaders = [
  "batch_id",
  "sku",
  "product_slug",
  "product_name",
  "category",
  "source_file",
  "source_type",
  "target_file",
  "target_type",
  "source_width",
  "source_height",
  "source_size_bytes",
  "target_width",
  "target_height",
  "target_format",
  "existing_target",
  "action",
  "status",
  "notes"
] as const;

const manifestHeaders = ["target_file", "source_file", "source_sha256", "output_sha256", "batch_id", "processed_at"] as const;
const mappingHeaders = [
  "sku",
  "product_slug",
  "product_name",
  "category",
  "source_folder",
  "target_folder",
  "main_image",
  "gallery_images",
  "main_alt",
  "gallery_alt",
  "status",
  "notes"
] as const;

type SourceType = "main" | "detail" | "terminal" | "construction" | "application" | "packaging" | "drawing" | "review" | "unknown";
type Action = "process" | "keep" | "review" | "skip" | "error";
type Status = "planned" | "processed" | "kept" | "review" | "skipped" | "failed";

type CsvRecord = Record<string, string>;

type ProductRow = CsvRecord & {
  sku: string;
  slug: string;
  product_name: string;
  category: string;
  image: string;
  gallery: string;
  status: string;
  publishable: string;
};

type MappingRow = CsvRecord & {
  sku: string;
  product_slug: string;
  product_name: string;
  category: string;
  source_folder: string;
  target_folder: string;
  main_image: string;
  gallery_images: string;
  main_alt: string;
  gallery_alt: string;
  status: string;
  notes: string;
};

type PlanRow = {
  batch_id: string;
  sku: string;
  product_slug: string;
  product_name: string;
  category: string;
  source_file: string;
  source_type: SourceType;
  target_file: string;
  target_type: string;
  source_width: string;
  source_height: string;
  source_size_bytes: string;
  target_width: string;
  target_height: string;
  target_format: string;
  existing_target: string;
  action: Action;
  status: Status;
  notes: string;
};

type ManifestRow = {
  target_file: string;
  source_file: string;
  source_sha256: string;
  output_sha256: string;
  batch_id: string;
  processed_at: string;
};

type ImageSource = {
  absolutePath: string;
  relativePath: string;
  fileName: string;
  type: SourceType;
  number: number;
  targetRelativePath: string;
  targetType: string;
};

function csvCell(value: string | number | boolean): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csvRow(values: Array<string | number | boolean>): string {
  return values.map(csvCell).join(",");
}

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

function writeCsv(filePath: string, headers: readonly string[], rows: CsvRecord[]): void {
  const lines = [csvRow([...headers])];
  for (const row of rows) lines.push(csvRow(headers.map((header) => row[header] ?? "")));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function writePlan(rows: PlanRow[]): void {
  writeCsv(planPath, planHeaders, rows);
}

function toPosix(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

function projectRelative(absolutePath: string): string {
  return toPosix(path.relative(projectRoot, absolutePath));
}

function publicReference(targetRelativePath: string): string {
  return `/${toPosix(path.relative(publicRoot, path.resolve(projectRoot, targetRelativePath)))}`;
}

function generateBatchId(): string {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return `${timestamp}-${crypto.randomBytes(3).toString("hex")}`;
}

function sha256File(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function readProducts(): { headers: string[]; rows: ProductRow[] } {
  const csv = readCsv(productsPath);
  return { headers: csv.headers, rows: csv.rows as ProductRow[] };
}

function readMappings(products: ProductRow[]): Map<string, MappingRow> {
  const csv = readCsv(mappingPath);
  const existing = new Map((csv.rows as MappingRow[]).map((row) => [row.product_slug, row]));
  for (const product of products) {
    if (existing.has(product.slug)) continue;
    existing.set(product.slug, {
      sku: product.sku,
      product_slug: product.slug,
      product_name: product.product_name,
      category: product.category,
      source_folder: `image-import/${product.category}/${product.slug}/`,
      target_folder: `/images/products/${product.slug}/`,
      main_image: "",
      gallery_images: "",
      main_alt: "",
      gallery_alt: "",
      status: "missing",
      notes: "No confirmed main source image."
    });
  }
  return existing;
}

function readManifest(): Map<string, ManifestRow> {
  const csv = readCsv(manifestPath);
  return new Map((csv.rows as ManifestRow[]).map((row) => [row.target_file, row]));
}

function writeManifest(manifest: Map<string, ManifestRow>): void {
  const rows = [...manifest.values()].sort((left, right) => left.target_file.localeCompare(right.target_file));
  writeCsv(manifestPath, manifestHeaders, rows);
}

function sourceToTarget(slug: string, type: SourceType, number: number): { relativePath: string; targetType: string } | undefined {
  const directory = path.join("public", "images", "products", slug);
  if (type === "main") {
    const fileName = number === 1 ? "main.webp" : `main-alternative-${String(number - 1).padStart(2, "0")}.webp`;
    return { relativePath: toPosix(path.join(directory, fileName)), targetType: number === 1 ? "main" : "main-alternative" };
  }
  if (type === "review" || type === "unknown") return undefined;
  return { relativePath: toPosix(path.join(directory, `${type}-${String(number).padStart(2, "0")}.webp`)), targetType: type };
}

function listProductSources(product: ProductRow): ImageSource[] {
  const directory = path.join(importRoot, product.category, product.slug);
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => {
      const absolutePath = path.join(directory, entry.name);
      const match = approvedSourcePattern.exec(entry.name);
      const type = match ? (match[1].toLowerCase() as SourceType) : "unknown";
      const number = match ? Number(match[2]) : 0;
      const target = sourceToTarget(product.slug, type, number);
      return {
        absolutePath,
        relativePath: projectRelative(absolutePath),
        fileName: entry.name,
        type,
        number,
        targetRelativePath: target?.relativePath ?? "",
        targetType: target?.targetType ?? ""
      };
    });
}

function hasConfirmedMain(sources: ImageSource[]): boolean {
  return sources.some((source) => source.type === "main" && source.number === 1);
}

function targetDimensions(sourceType: SourceType, width: number, height: number, orientation?: number): { width: number; height: number } {
  if (sourceType === "main") return { width: 1200, height: 1200 };
  const swapsDimensions = orientation !== undefined && orientation >= 5 && orientation <= 8;
  const orientedWidth = swapsDimensions ? height : width;
  const orientedHeight = swapsDimensions ? width : height;
  const scale = Math.min(1, 1200 / orientedWidth, 900 / orientedHeight);
  return { width: Math.max(1, Math.round(orientedWidth * scale)), height: Math.max(1, Math.round(orientedHeight * scale)) };
}

function targetIsScriptGenerated(targetFile: string, manifest: Map<string, ManifestRow>): boolean {
  const record = manifest.get(targetFile);
  const absoluteTarget = path.resolve(projectRoot, targetFile);
  return Boolean(record && fs.existsSync(absoluteTarget) && sha256File(absoluteTarget) === record.output_sha256);
}

async function buildPlan(force: boolean): Promise<{ rows: PlanRow[]; seriousErrors: string[]; missingMainProducts: string[]; unmatchedImages: string[] }> {
  const batchId = generateBatchId();
  const productData = readProducts();
  const products = productData.rows.filter((product) => product.status === "published" && product.publishable.toLowerCase() === "true");
  const productDirectories = new Set(products.map((product) => `${product.category}/${product.slug}`));
  const mappings = readMappings(products);
  const manifest = readManifest();
  const rows: PlanRow[] = [];
  const seriousErrors: string[] = [];
  const missingMainProducts: string[] = [];
  const unmatchedImages: string[] = [];

  for (const product of products) {
    const sources = listProductSources(product);
    const confirmedMain = hasConfirmedMain(sources);
    const confirmedMainSource = sources.find((source) => source.type === "main" && source.number === 1);
    const confirmedMainHash = confirmedMainSource ? sha256File(confirmedMainSource.absolutePath) : "";
    const seenGallerySourceHashes = new Set<string>();
    const mappingStatus = mappings.get(product.slug)?.status ?? "missing";
    if (!confirmedMain) missingMainProducts.push(product.slug);
    if (sources.length === 0) {
      rows.push({
        batch_id: batchId,
        sku: product.sku,
        product_slug: product.slug,
        product_name: product.product_name,
        category: product.category,
        source_file: "",
        source_type: "unknown",
        target_file: "",
        target_type: "",
        source_width: "",
        source_height: "",
        source_size_bytes: "",
        target_width: "",
        target_height: "",
        target_format: "webp",
        existing_target: "false",
        action: "skip",
        status: "skipped",
        notes: "No authorized source image exists in the exact category/product_slug directory."
      });
      continue;
    }

    for (const source of sources) {
      const stat = fs.statSync(source.absolutePath);
      const sourceHash = sha256File(source.absolutePath);
      const galleryEligibleType = source.type !== "main" && source.type !== "review" && source.type !== "unknown";
      const duplicatesEarlierGallerySource = galleryEligibleType && seenGallerySourceHashes.has(sourceHash);
      if (galleryEligibleType && !duplicatesEarlierGallerySource) seenGallerySourceHashes.add(sourceHash);
      let width = 0;
      let height = 0;
      let orientation: number | undefined;
      let action: Action = "skip";
      let status: Status = "skipped";
      const notes: string[] = [];
      try {
        const metadata = await sharp(source.absolutePath, { failOn: "error" }).metadata();
        width = metadata.width ?? 0;
        height = metadata.height ?? 0;
        orientation = metadata.orientation;
        if (width <= 0 || height <= 0) throw new Error("Image dimensions are unavailable.");
      } catch (error) {
        action = "error";
        status = "failed";
        const message = error instanceof Error ? error.message : String(error);
        notes.push(`Source image cannot be read: ${message}`);
        seriousErrors.push(`${source.relativePath}: ${message}`);
      }

      const target = source.targetRelativePath;
      const absoluteTarget = target ? path.resolve(projectRoot, target) : "";
      const existingTarget = Boolean(absoluteTarget && fs.existsSync(absoluteTarget));
      const generatedTarget = existingTarget && targetIsScriptGenerated(target, manifest);
      const dimensions = width > 0 && height > 0 ? targetDimensions(source.type, width, height, orientation) : { width: 0, height: 0 };

      if (action !== "error") {
        if (source.type === "review" || source.type === "unknown") {
          action = "review";
          status = "review";
          notes.push("Review or unconfirmed source images are excluded from formal production output.");
        } else if (!confirmedMain) {
          action = "skip";
          status = "skipped";
          notes.push("Product is missing main-original-01; no source image for this product may enter the formal directory.");
        } else if (source.type !== "main" && confirmedMainHash && sha256File(source.absolutePath) === confirmedMainHash) {
          action = "skip";
          status = "skipped";
          notes.push("Source is byte-identical to the selected main-original-01 copy and is excluded to prevent gallery duplication.");
        } else if (duplicatesEarlierGallerySource) {
          action = "skip";
          status = "skipped";
          notes.push("Source is byte-identical to an earlier gallery source and is excluded to prevent duplicate output.");
        } else if (existingTarget && !generatedTarget) {
          action = "review";
          status = "review";
          notes.push("Existing target is not recorded as script-generated and will not be overwritten.");
          seriousErrors.push(`Manual target collision: ${target}`);
        } else if (existingTarget && generatedTarget && !force) {
          action = "keep";
          status = "kept";
          notes.push("Existing target matches the processing manifest; use --force to regenerate it.");
        } else if (!mappingStatusesAllowedForProcessing.has(mappingStatus)) {
          action = "skip";
          status = "skipped";
          notes.push(`Mapping status ${mappingStatus || "blank"} is not eligible for automatic processing.`);
        } else {
          action = "process";
          status = "planned";
          notes.push(force && existingTarget ? "Script-generated target is eligible for forced regeneration." : "Source is eligible for WebP processing.");
        }
      }

      rows.push({
        batch_id: batchId,
        sku: product.sku,
        product_slug: product.slug,
        product_name: product.product_name,
        category: product.category,
        source_file: source.relativePath,
        source_type: source.type,
        target_file: target,
        target_type: source.targetType,
        source_width: width ? String(width) : "",
        source_height: height ? String(height) : "",
        source_size_bytes: String(stat.size),
        target_width: dimensions.width ? String(dimensions.width) : "",
        target_height: dimensions.height ? String(dimensions.height) : "",
        target_format: "webp",
        existing_target: String(existingTarget),
        action,
        status,
        notes: notes.join(" ")
      });
    }
  }

  if (fs.existsSync(importRoot)) {
    for (const categoryEntry of fs.readdirSync(importRoot, { withFileTypes: true })) {
      if (!categoryEntry.isDirectory() || categoryEntry.name === "rejected" || categoryEntry.name === "unmatched") continue;
      const categoryPath = path.join(importRoot, categoryEntry.name);
      for (const productEntry of fs.readdirSync(categoryPath, { withFileTypes: true })) {
        if (!productEntry.isDirectory() || productDirectories.has(`${categoryEntry.name}/${productEntry.name}`)) continue;
        const unmatchedDirectory = path.join(categoryPath, productEntry.name);
        for (const fileEntry of fs.readdirSync(unmatchedDirectory, { withFileTypes: true })) {
          if (fileEntry.isFile() && supportedExtensions.has(path.extname(fileEntry.name).toLowerCase())) unmatchedImages.push(projectRelative(path.join(unmatchedDirectory, fileEntry.name)));
        }
      }
    }
  }

  const duplicateTargets = new Map<string, number>();
  for (const row of rows.filter((candidate) => candidate.action === "process")) {
    const key = row.target_file.toLowerCase();
    duplicateTargets.set(key, (duplicateTargets.get(key) ?? 0) + 1);
  }
  for (const [target, count] of duplicateTargets) if (count > 1) seriousErrors.push(`Duplicate target (${count}): ${target}`);
  return { rows, seriousErrors: [...new Set(seriousErrors)], missingMainProducts, unmatchedImages };
}

async function renderWebp(sourceFile: string, targetFile: string, sourceType: SourceType, replaceExisting: boolean): Promise<void> {
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  let output: Buffer;
  if (sourceType === "main") {
    const contained = await sharp(sourceFile, { failOn: "error" })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .toBuffer();
    output = await sharp({ create: { width: 1200, height: 1200, channels: 3, background: { r: 255, g: 255, b: 255 } } })
      .composite([{ input: contained, gravity: "center" }])
      .webp({ quality: 82 })
      .toBuffer();
  } else {
    output = await sharp(sourceFile, { failOn: "error" })
      .rotate()
      .resize({ width: 1200, height: 900, fit: "inside", withoutEnlargement: true })
      .webp({ quality: sourceType === "drawing" ? 88 : 82 })
      .toBuffer();
  }
  const temporaryFile = `${targetFile}.processing-${process.pid}-${crypto.randomBytes(3).toString("hex")}`;
  fs.writeFileSync(temporaryFile, output, { flag: "wx" });
  const backupFile = `${targetFile}.backup-${process.pid}-${crypto.randomBytes(3).toString("hex")}`;
  try {
    if (fs.existsSync(targetFile)) {
      if (!replaceExisting) throw new Error("Target became occupied during processing.");
      fs.renameSync(targetFile, backupFile);
    }
    fs.renameSync(temporaryFile, targetFile);
    if (fs.existsSync(backupFile)) fs.rmSync(backupFile);
  } catch (error) {
    if (fs.existsSync(temporaryFile)) fs.rmSync(temporaryFile);
    if (fs.existsSync(backupFile) && !fs.existsSync(targetFile)) fs.renameSync(backupFile, targetFile);
    throw error;
  }
}

function gallerySortKey(file: string): string {
  const name = path.basename(file);
  const priorities: Array<[RegExp, number]> = [
    [/^detail-/, 10],
    [/^main-alternative-/, 20],
    [/^terminal-/, 30],
    [/^construction-/, 40],
    [/^drawing-/, 50],
    [/^application-/, 60],
    [/^packaging-/, 70]
  ];
  const priority = priorities.find(([pattern]) => pattern.test(name))?.[1] ?? 99;
  return `${String(priority).padStart(2, "0")}-${name}`;
}

function altForTarget(productName: string, targetType: string): string {
  if (targetType === "main") return productName;
  if (targetType === "detail" || targetType === "main-alternative") return `Close-up of ${productName}`;
  if (targetType === "terminal") return `Terminal detail on ${productName}`;
  if (targetType === "construction") return `Construction detail of ${productName}`;
  if (targetType === "application") return `${productName} application view`;
  if (targetType === "packaging") return `Packaging example for ${productName}`;
  if (targetType === "drawing") return `Technical drawing of ${productName}`;
  return productName;
}

async function executePlan(force: boolean): Promise<{ rows: PlanRow[]; seriousErrors: string[] }> {
  const planCsv = readCsv(planPath);
  const rows = planCsv.rows as PlanRow[];
  if (rows.length === 0) throw new Error("Processing plan is missing or empty. Run images:process:plan first.");
  const batchIds = new Set(rows.map((row) => row.batch_id));
  if (batchIds.size !== 1) throw new Error("Processing plan contains multiple batch IDs.");
  const manifest = readManifest();
  const seriousErrors: string[] = [];
  const processRows = rows.filter((row) => row.action === "process" && row.status === "planned");

  for (const row of processRows) {
    const source = path.resolve(projectRoot, row.source_file);
    const target = path.resolve(projectRoot, row.target_file);
    const sourceSafe = source.startsWith(`${importRoot}${path.sep}`);
    const targetSafe = target.startsWith(`${productImagesRoot}${path.sep}`);
    if (!sourceSafe || !targetSafe) seriousErrors.push(`Unsafe plan path: ${row.source_file} -> ${row.target_file}`);
    if (!fs.existsSync(source)) seriousErrors.push(`Source file is missing: ${row.source_file}`);
    if (fs.existsSync(target) && (!force || !targetIsScriptGenerated(row.target_file, manifest))) seriousErrors.push(`Target cannot be overwritten: ${row.target_file}`);
  }
  const duplicateTargets = processRows.map((row) => row.target_file.toLowerCase()).filter((target, index, all) => all.indexOf(target) !== index);
  for (const target of duplicateTargets) seriousErrors.push(`Duplicate target in executable plan: ${target}`);
  if (seriousErrors.length > 0) return { rows, seriousErrors: [...new Set(seriousErrors)] };

  for (const row of processRows) {
    const source = path.resolve(projectRoot, row.source_file);
    const target = path.resolve(projectRoot, row.target_file);
    try {
      await renderWebp(source, target, row.source_type, force && fs.existsSync(target));
      manifest.set(row.target_file, {
        target_file: row.target_file,
        source_file: row.source_file,
        source_sha256: sha256File(source),
        output_sha256: sha256File(target),
        batch_id: row.batch_id,
        processed_at: new Date().toISOString()
      });
      row.status = "processed";
    } catch (error) {
      row.status = "failed";
      const message = error instanceof Error ? error.message : String(error);
      row.notes = `${row.notes} Processing failed: ${message}`.trim();
      seriousErrors.push(`${row.source_file}: ${message}`);
    }
  }

  for (const productSlug of new Set(rows.map((row) => row.product_slug).filter(Boolean))) {
    const successfulRows = rows
      .filter((row) => row.product_slug === productSlug && (row.status === "processed" || row.status === "kept") && row.target_file && fs.existsSync(path.resolve(projectRoot, row.target_file)))
      .sort((left, right) => {
        if (left.target_type === "main") return -1;
        if (right.target_type === "main") return 1;
        return gallerySortKey(left.target_file).localeCompare(gallerySortKey(right.target_file));
      });
    const seenOutputHashes = new Set<string>();
    for (const row of successfulRows) {
      const target = path.resolve(projectRoot, row.target_file);
      const outputHash = sha256File(target);
      if (!seenOutputHashes.has(outputHash)) {
        seenOutputHashes.add(outputHash);
        continue;
      }
      if (!targetIsScriptGenerated(row.target_file, manifest)) {
        seriousErrors.push(`Duplicate output is not safely recorded as script-generated: ${row.target_file}`);
        continue;
      }
      fs.rmSync(target);
      manifest.delete(row.target_file);
      row.status = "skipped";
      row.action = "skip";
      row.notes = `${row.notes} Removed script-generated duplicate output after hash comparison.`.trim();
    }
  }
  writePlan(rows);
  writeManifest(manifest);

  const productData = readProducts();
  const publishedProducts = productData.rows.filter((product) => product.status === "published" && product.publishable.toLowerCase() === "true");
  const mappings = readMappings(publishedProducts);
  for (const product of publishedProducts) {
    const productRows = rows.filter((row) => row.product_slug === product.slug && (row.status === "processed" || row.status === "kept"));
    const mainRow = productRows.find((row) => row.target_type === "main" && fs.existsSync(path.resolve(projectRoot, row.target_file)));
    const mapping = mappings.get(product.slug);
    if (!mapping) continue;
    if (!mainRow) {
      mapping.status = rows.some((row) => row.product_slug === product.slug && row.action === "review") ? "review" : "missing";
      mapping.notes = "Missing confirmed main-original-01; placeholder remains active.";
      continue;
    }
    const galleryRows = productRows
      .filter((row) => row.target_type !== "main" && row.target_file && fs.existsSync(path.resolve(projectRoot, row.target_file)))
      .sort((left, right) => gallerySortKey(left.target_file).localeCompare(gallerySortKey(right.target_file)));
    const mainReference = publicReference(mainRow.target_file);
    const galleryReferences = galleryRows.map((row) => publicReference(row.target_file));
    mapping.target_folder = `/images/products/${product.slug}/`;
    mapping.main_image = mainReference;
    mapping.gallery_images = galleryReferences.join("|");
    mapping.main_alt = product.product_name;
    mapping.gallery_alt = galleryRows.map((row) => altForTarget(product.product_name, row.target_type)).join("|");
    mapping.status = "processed";
    mapping.notes = "Formal WebP files generated; page and build validation are required before published status.";
    product.image = mainReference;
    product.gallery = galleryReferences.join("|");
  }
  writeCsv(mappingPath, mappingHeaders, publishedProducts.map((product) => mappings.get(product.slug) as MappingRow));
  writeCsv(productsPath, productData.headers, productData.rows);
  return { rows, seriousErrors };
}

function summarize(rows: PlanRow[], seriousErrors: string[], operation: string, missingMainProducts: string[] = [], unmatchedImages: string[] = []): void {
  console.log(`Operation: ${operation}`);
  console.log(`Plan rows: ${rows.length}`);
  console.log(`Process: ${rows.filter((row) => row.action === "process").length}`);
  console.log(`Keep: ${rows.filter((row) => row.action === "keep").length}`);
  console.log(`Review: ${rows.filter((row) => row.action === "review").length}`);
  console.log(`Skip: ${rows.filter((row) => row.action === "skip").length}`);
  console.log(`Failed: ${rows.filter((row) => row.status === "failed").length}`);
  console.log(`Products missing main-original-01: ${missingMainProducts.length}`);
  console.log(`Unmatched images: ${unmatchedImages.length}`);
  console.log(`Serious errors: ${seriousErrors.length}`);
  for (const product of missingMainProducts) console.log(`MISSING_MAIN ${product}`);
  for (const image of unmatchedImages) console.log(`UNMATCHED ${image}`);
  for (const error of seriousErrors) console.error(error);
  console.log(`Wrote ${projectRelative(planPath)}.`);
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const force = args.has("--force");
  if (args.has("--execute")) {
    const result = await executePlan(force);
    summarize(result.rows, result.seriousErrors, force ? "execute --force" : "execute");
    if (result.seriousErrors.length > 0) process.exitCode = 1;
    return;
  }
  const result = await buildPlan(force);
  writePlan(result.rows);
  summarize(result.rows, result.seriousErrors, "plan", result.missingMainProducts, result.unmatchedImages);
  if (result.seriousErrors.length > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
