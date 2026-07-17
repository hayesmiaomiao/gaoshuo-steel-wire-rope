import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getPublishedProducts } from "../src/lib/products/data";

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, "public");
const reportCsvPath = path.join(projectRoot, "reports", "product-image-audit.csv");
const reportMarkdownPath = path.join(projectRoot, "reports", "product-image-audit.md");
const mappingPath = path.join(projectRoot, "data", "product-images.csv");
const mainSelectionPath = path.join(projectRoot, "reports", "product-main-image-selection.csv");
const placeholderPrefix = "/images/placeholders/";
const formalPrefix = "/images/products/";

type MappingRow = {
  product_slug: string;
  main_alt: string;
  gallery_alt: string;
  status: string;
};

type MainSelectionRow = {
  product_slug: string;
  width: string;
  height: string;
  selected_source_file: string;
  needs_manual_review: string;
};

type ImageInspection = {
  reference: string;
  absolutePath: string;
  exists: boolean;
  size: number;
  width: number;
  height: number;
  format: string;
  hash: string;
  error: string;
};

type AuditRow = {
  sku: string;
  product_slug: string;
  product_name: string;
  image: string;
  image_exists: string;
  uses_placeholder: string;
  gallery_count: string;
  missing_gallery_paths: string;
  invalid_location: string;
  external_reference: string;
  image_import_reference: string;
  windows_absolute_path: string;
  main_format: string;
  main_width: string;
  main_height: string;
  main_size_bytes: string;
  exceeds_500kb: string;
  main_below_800px: string;
  duplicate_main_reference: string;
  duplicate_file_hash: string;
  missing_alt: string;
  needs_manual_review: string;
  gallery_repeats_main: string;
  schema_image_valid: string;
  open_graph_image_valid: string;
  image_404_risk: string;
  status: string;
  notes: string;
};

const auditHeaders = [
  "sku",
  "product_slug",
  "product_name",
  "image",
  "image_exists",
  "uses_placeholder",
  "gallery_count",
  "missing_gallery_paths",
  "invalid_location",
  "external_reference",
  "image_import_reference",
  "windows_absolute_path",
  "main_format",
  "main_width",
  "main_height",
  "main_size_bytes",
  "exceeds_500kb",
  "main_below_800px",
  "duplicate_main_reference",
  "duplicate_file_hash",
  "missing_alt",
  "needs_manual_review",
  "gallery_repeats_main",
  "schema_image_valid",
  "open_graph_image_valid",
  "image_404_risk",
  "status",
  "notes"
] as const;

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

function readMappings(): Map<string, MappingRow> {
  if (!fs.existsSync(mappingPath)) return new Map();
  const lines = fs.readFileSync(mappingPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0] ?? "");
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])) as MappingRow;
  });
  return new Map(rows.map((row) => [row.product_slug, row]));
}

function readMainSelections(): Map<string, MainSelectionRow> {
  if (!fs.existsSync(mainSelectionPath)) return new Map();
  const lines = fs.readFileSync(mainSelectionPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0] ?? "");
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])) as MainSelectionRow;
  });
  return new Map(rows.map((row) => [row.product_slug, row]));
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function writeAuditCsv(rows: AuditRow[]): void {
  const lines = [auditHeaders.join(",")];
  for (const row of rows) lines.push(auditHeaders.map((header) => csvCell(row[header])).join(","));
  fs.mkdirSync(path.dirname(reportCsvPath), { recursive: true });
  fs.writeFileSync(reportCsvPath, `${lines.join("\n")}\n`, "utf8");
}

function isExternal(reference: string): boolean {
  return /^(?:https?:)?\/\//i.test(reference);
}

function isWindowsAbsolute(reference: string): boolean {
  return /^[a-z]:[\\/]/i.test(reference) || reference.startsWith("\\\\");
}

function resolvePublicReference(reference: string): string | undefined {
  if (!reference.startsWith("/") || isExternal(reference) || isWindowsAbsolute(reference)) return undefined;
  const resolved = path.resolve(publicRoot, reference.replace(/^\/+/, ""));
  if (resolved !== publicRoot && !resolved.startsWith(`${publicRoot}${path.sep}`)) return undefined;
  return resolved;
}

async function inspectImage(reference: string): Promise<ImageInspection> {
  const absolutePath = resolvePublicReference(reference) ?? "";
  if (!absolutePath || !fs.existsSync(absolutePath)) {
    return { reference, absolutePath, exists: false, size: 0, width: 0, height: 0, format: "", hash: "", error: "File does not exist in public." };
  }
  try {
    const stat = fs.statSync(absolutePath);
    const metadata = await sharp(absolutePath, { failOn: "error" }).metadata();
    return {
      reference,
      absolutePath,
      exists: true,
      size: stat.size,
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      format: metadata.format ?? "",
      hash: crypto.createHash("sha256").update(fs.readFileSync(absolutePath)).digest("hex"),
      error: ""
    };
  } catch (error) {
    return {
      reference,
      absolutePath,
      exists: true,
      size: fs.statSync(absolutePath).size,
      width: 0,
      height: 0,
      format: "",
      hash: "",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main(): Promise<void> {
  const products = getPublishedProducts().filter((product) => product.publishableBoolean);
  const mappings = readMappings();
  const mainSelections = readMainSelections();
  const inspections = new Map<string, ImageInspection>();
  const allReferences = [...new Set(products.flatMap((product) => [product.image, ...product.galleryList]).filter(Boolean))];
  for (const reference of allReferences) inspections.set(reference, await inspectImage(reference));

  const formalMainReferences = products.map((product) => product.image).filter((reference) => reference.startsWith(formalPrefix));
  const mainReferenceCounts = new Map<string, number>();
  for (const reference of formalMainReferences) mainReferenceCounts.set(reference, (mainReferenceCounts.get(reference) ?? 0) + 1);
  const formalHashOwners = new Map<string, string[]>();
  for (const product of products) {
    for (const reference of [product.image, ...product.galleryList].filter((candidate) => candidate.startsWith(formalPrefix))) {
      const hash = inspections.get(reference)?.hash;
      if (!hash) continue;
      const owners = formalHashOwners.get(hash) ?? [];
      owners.push(`${product.slug}:${reference}`);
      formalHashOwners.set(hash, owners);
    }
  }

  const productPageSource = fs.readFileSync(path.join(projectRoot, "app", "products", "[slug]", "page.tsx"), "utf8");
  const schemaSource = fs.readFileSync(path.join(projectRoot, "src", "lib", "seo", "schema.ts"), "utf8");
  const openGraphConfigured = /image:\s*product\.image/u.test(productPageSource);
  const schemaConfigured = /product\.galleryList/u.test(schemaSource) && /absoluteUrl\(image\)/u.test(schemaSource);
  const rows: AuditRow[] = [];
  const fatalErrors: string[] = [];

  for (const product of products) {
    const mapping = mappings.get(product.slug);
    const mainSelection = mainSelections.get(product.slug);
    const main = inspections.get(product.image);
    const galleryInspections = product.galleryList.map((reference) => inspections.get(reference));
    const missingGallery = product.galleryList.filter((reference, index) => !galleryInspections[index]?.exists);
    const placeholder = product.image.startsWith(placeholderPrefix);
    const external = [product.image, ...product.galleryList].filter(isExternal);
    const importReferences = [product.image, ...product.galleryList].filter((reference) => reference.toLowerCase().includes("image-import"));
    const windowsPaths = [product.image, ...product.galleryList].filter(isWindowsAbsolute);
    const invalidLocation = product.image && !placeholder && !product.image.startsWith(formalPrefix);
    const galleryRepeatsMain = product.galleryList.includes(product.image);
    const duplicateReference = product.image.startsWith(formalPrefix) && (mainReferenceCounts.get(product.image) ?? 0) > 1;
    const duplicateHash = [product.image, ...product.galleryList]
      .filter((reference) => reference.startsWith(formalPrefix))
      .some((reference) => {
        const hash = inspections.get(reference)?.hash;
        return Boolean(hash && (formalHashOwners.get(hash)?.length ?? 0) > 1);
      });
    const missingAlt = placeholder
      ? !product.product_name
      : !mapping?.main_alt || product.galleryList.length !== (mapping.gallery_alt ?? "").split("|").filter(Boolean).length;
    const exceeds500Kb = [main, ...galleryInspections].some((inspection) => Boolean(inspection && inspection.size > 500 * 1024));
    const selectedSourceWidth = Number(mainSelection?.width ?? "0");
    const selectedSourceHeight = Number(mainSelection?.height ?? "0");
    const mainBelow800 = Boolean(main?.exists && !placeholder && selectedSourceWidth > 0 && selectedSourceHeight > 0 && (selectedSourceWidth < 800 || selectedSourceHeight < 800));
    const needsManualReview = mainSelection?.needs_manual_review === "true";
    const mainNotWebp = Boolean(main?.exists && !placeholder && main.format !== "webp");
    const image404Risk = !main?.exists || missingGallery.length > 0 || external.length > 0 || importReferences.length > 0 || windowsPaths.length > 0;
    const notes: string[] = [];
    if (placeholder) notes.push("Published product still uses the approved placeholder fallback.");
    if (!main?.exists) notes.push("Main image path does not resolve to a public file.");
    if (main?.error) notes.push(`Main image read error: ${main.error}`);
    if (mainNotWebp) notes.push("Formal main image is not WebP.");
    if (mainBelow800) notes.push(`Selected main source is below 800px (${selectedSourceWidth}x${selectedSourceHeight}); the 1200px output uses padding without forced enlargement.`);
    if (needsManualReview) notes.push(`Temporary main selected from review source: ${mainSelection?.selected_source_file ?? "unknown"}.`);
    if (exceeds500Kb) notes.push("At least one referenced image exceeds 500KB.");
    if (duplicateReference) notes.push("Formal main reference is shared by multiple products.");
    if (duplicateHash) notes.push("A formal product image hash is duplicated.");
    if (missingAlt) notes.push("One or more formal image alt entries are missing.");
    if (galleryRepeatsMain) notes.push("Gallery repeats the main image.");
    if (!schemaConfigured) notes.push("Product Schema is not configured to read image and gallery fields.");
    if (!openGraphConfigured) notes.push("Product Open Graph metadata is not configured to read the image field.");

    const fatal = image404Risk || Boolean(invalidLocation) || mainNotWebp || missingAlt || galleryRepeatsMain || !schemaConfigured || !openGraphConfigured;
    if (fatal && !placeholder) fatalErrors.push(`${product.sku}: ${notes.join(" ")}`);
    rows.push({
      sku: product.sku,
      product_slug: product.slug,
      product_name: product.product_name,
      image: product.image,
      image_exists: String(Boolean(main?.exists)),
      uses_placeholder: String(placeholder),
      gallery_count: String(product.galleryList.length),
      missing_gallery_paths: missingGallery.join("|"),
      invalid_location: String(Boolean(invalidLocation)),
      external_reference: external.join("|"),
      image_import_reference: importReferences.join("|"),
      windows_absolute_path: windowsPaths.join("|"),
      main_format: main?.format ?? "",
      main_width: main?.width ? String(main.width) : "",
      main_height: main?.height ? String(main.height) : "",
      main_size_bytes: main?.size ? String(main.size) : "",
      exceeds_500kb: String(exceeds500Kb),
      main_below_800px: String(mainBelow800),
      duplicate_main_reference: String(duplicateReference),
      duplicate_file_hash: String(duplicateHash),
      missing_alt: String(missingAlt),
      needs_manual_review: String(needsManualReview),
      gallery_repeats_main: String(galleryRepeatsMain),
      schema_image_valid: String(schemaConfigured && Boolean(main?.exists)),
      open_graph_image_valid: String(openGraphConfigured && Boolean(main?.exists)),
      image_404_risk: String(image404Risk),
      status: fatal && !placeholder ? "error" : placeholder ? "placeholder" : "ready",
      notes: notes.join(" ")
    });
  }

  writeAuditCsv(rows);
  const formalImages = [...inspections.values()].filter((inspection) => inspection.reference.startsWith(formalPrefix));
  const duplicateHashGroups = [...formalHashOwners.values()].filter((owners) => owners.length > 1);
  const lines = [
    "# Product Image Audit",
    "",
    `- Generated: ${new Date().toISOString()}`,
    `- Published and publishable products: ${products.length}`,
    `- Products using placeholders: ${rows.filter((row) => row.uses_placeholder === "true").length}`,
    `- Products using formal main images: ${rows.filter((row) => row.uses_placeholder === "false" && row.image_exists === "true").length}`,
    `- Formal referenced images: ${formalImages.length}`,
    `- Images over 500KB: ${formalImages.filter((image) => image.size > 500 * 1024).length}`,
    `- Main images below 800px: ${rows.filter((row) => row.main_below_800px === "true").length}`,
    `- Duplicate formal main references: ${rows.filter((row) => row.duplicate_main_reference === "true").length}`,
    `- Duplicate formal hash groups: ${duplicateHashGroups.length}`,
    `- Missing referenced paths: ${rows.filter((row) => row.image_404_risk === "true").length}`,
    `- External references: ${rows.filter((row) => row.external_reference).length}`,
    `- image-import references: ${rows.filter((row) => row.image_import_reference).length}`,
    `- Missing formal alt entries: ${rows.filter((row) => row.missing_alt === "true").length}`,
    `- Products needing manual main-image review: ${rows.filter((row) => row.needs_manual_review === "true").length}`,
    `- Fatal formal-image errors: ${fatalErrors.length}`,
    "",
    "## Products still using placeholders",
    "",
    ...rows.filter((row) => row.uses_placeholder === "true").map((row) => `- ${row.product_slug}`),
    "",
    "## Products needing manual main-image review",
    "",
    ...rows.filter((row) => row.needs_manual_review === "true").map((row) => `- ${row.product_slug}`),
    "",
    "## Fatal formal-image errors",
    "",
    ...(fatalErrors.length > 0 ? fatalErrors.map((error) => `- ${error}`) : ["- None"]),
    ""
  ];
  fs.writeFileSync(reportMarkdownPath, lines.join("\n"), "utf8");
  console.log(`Published and publishable products: ${products.length}`);
  console.log(`Products using placeholders: ${rows.filter((row) => row.uses_placeholder === "true").length}`);
  console.log(`Products using formal main images: ${rows.filter((row) => row.uses_placeholder === "false" && row.image_exists === "true").length}`);
  console.log(`Formal referenced images: ${formalImages.length}`);
  console.log(`Fatal formal-image errors: ${fatalErrors.length}`);
  console.log(`Wrote ${path.relative(projectRoot, reportCsvPath)}.`);
  console.log(`Wrote ${path.relative(projectRoot, reportMarkdownPath)}.`);
  if (fatalErrors.length > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
