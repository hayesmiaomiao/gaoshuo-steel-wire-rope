import fs from "node:fs";
import path from "node:path";
import { getPublishedProducts } from "../src/lib/products/data";

const projectRoot = process.cwd();
const importRoot = path.join(projectRoot, "image-import");
const mappingPath = path.join(projectRoot, "data", "product-images.csv");
const reportPath = path.join(projectRoot, "reports", "product-image-mapping.csv");

const imageExtensions = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".heic",
  ".heif",
  ".jpeg",
  ".jpg",
  ".png",
  ".tif",
  ".tiff",
  ".webp"
]);

const blockedBrandOrDomainPatterns = [
  /just[\s._-]*wire[\s._-]*rope/i,
  /justwirerope/i,
  /wire[\s._-]*rope[\s._-]*assy/i,
  /wireropeassy/i,
  /guo[\s._-]*feng/i,
  /astro[\s._-]*wire[\s._-]*rope/i
];

const emailPattern = /[a-z0-9._%+-]+(?:@|%40)[a-z0-9.-]+\.[a-z]{2,}/i;
const whatsappPattern = /(?:whats[\s._-]*app|wa[\s._-]*me)/i;
const phonePattern = /(?:tel|phone|mobile|wechat|whatsapp|contact)[\s._()+-]*\d/i;

type ExistingMapping = {
  status?: string;
  main_image?: string;
  gallery_images?: string;
  main_alt?: string;
  gallery_alt?: string;
  notes?: string;
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];
    if (character === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      cells.push(value);
      value = "";
    } else {
      value += character;
    }
  }

  cells.push(value);
  return cells;
}

function readExistingMappings(): Map<string, ExistingMapping> {
  if (!fs.existsSync(mappingPath)) return new Map();
  const lines = fs.readFileSync(mappingPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0] ?? "");
  const rows = new Map<string, ExistingMapping>();

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    if (record.product_slug) rows.set(record.product_slug, record);
  }
  return rows;
}

function csvCell(value: string | number | boolean): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csvRow(values: Array<string | number | boolean>): string {
  return values.map(csvCell).join(",");
}

function toPosix(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

function isImageFile(fileName: string): boolean {
  return imageExtensions.has(path.extname(fileName).toLowerCase());
}

function listImageFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isImageFile(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function hasBlockedBrandOrDomain(fileNames: string[]): boolean {
  return fileNames.some((fileName) => blockedBrandOrDomainPatterns.some((pattern) => pattern.test(fileName)));
}

function hasContact(fileNames: string[]): boolean {
  return fileNames.some(
    (fileName) => emailPattern.test(fileName) || whatsappPattern.test(fileName) || phonePattern.test(fileName)
  );
}

function findMainCandidate(fileNames: string[]): string | undefined {
  const explicit = fileNames.filter((fileName) => /^(?:main|hero|cover)(?:[-_.]|\d)/i.test(fileName));
  return explicit.length === 1 ? explicit[0] : undefined;
}

function findGalleryCandidates(fileNames: string[], mainCandidate?: string): string[] {
  return fileNames.filter((fileName) => fileName !== mainCandidate);
}

const products = getPublishedProducts();
const existingMappings = readExistingMappings();
const expectedFolders = new Set(products.map((product) => path.join(importRoot, product.category, product.slug)));
const orphanImages: string[] = [];

if (fs.existsSync(importRoot)) {
  const pending = [importRoot];
  while (pending.length > 0) {
    const directory = pending.pop();
    if (!directory) continue;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(entryPath);
      if (entry.isFile() && isImageFile(entry.name)) {
        const ownerFolder = path.dirname(entryPath);
        if (!expectedFolders.has(ownerFolder)) orphanImages.push(toPosix(path.relative(projectRoot, entryPath)));
      }
    }
  }
}

const mappingRows = [
  csvRow([
    "sku",
    "product_slug",
    "product_name",
    "category",
    "source_folder",
    "main_image",
    "gallery_images",
    "main_alt",
    "gallery_alt",
    "status",
    "notes"
  ])
];

const reportRows = [
  csvRow([
    "sku",
    "product_slug",
    "product_name",
    "category",
    "source_folder",
    "source_image_count",
    "has_main_image",
    "has_gallery_images",
    "can_auto_match",
    "contains_old_brand",
    "contains_contact_details",
    "suggested_status",
    "notes"
  ])
];

let importedImageCount = 0;
let missingProductCount = 0;
let reviewProductCount = 0;
let blockedBrandProductCount = 0;
let contactProductCount = 0;

for (const product of products) {
  const sourceDirectory = path.join(importRoot, product.category, product.slug);
  const sourceFolder = `${toPosix(path.relative(projectRoot, sourceDirectory))}/`;
  const images = listImageFiles(sourceDirectory);
  const mainCandidate = findMainCandidate(images);
  const galleryCandidates = findGalleryCandidates(images, mainCandidate);
  const containsOldBrand = hasBlockedBrandOrDomain(images);
  const containsContactDetails = hasContact(images);
  const previous = existingMappings.get(product.slug);
  const protectedStatus = previous?.status === "published" || previous?.status === "rejected";
  const notes: string[] = [];

  importedImageCount += images.length;
  if (containsOldBrand) blockedBrandProductCount += 1;
  if (containsContactDetails) contactProductCount += 1;

  let suggestedStatus: "missing" | "review" | "ready" | "published" | "rejected";
  if (protectedStatus) {
    suggestedStatus = previous.status as "published" | "rejected";
    notes.push(`Preserved existing ${suggestedStatus} status.`);
  } else if (images.length === 0) {
    suggestedStatus = "missing";
    missingProductCount += 1;
    notes.push("No source image file found; only the folder README may be present.");
  } else if (containsOldBrand || containsContactDetails) {
    suggestedStatus = "review";
    reviewProductCount += 1;
    notes.push("A filename contains a blocked brand, domain, or contact marker; visible image content still requires manual review.");
  } else {
    suggestedStatus = "review";
    reviewProductCount += 1;
    notes.push("Folder-to-slug match found, but visible product identity, fittings, logos, watermarks, and alt text require manual confirmation.");
  }

  if (images.length > 0 && !mainCandidate) {
    notes.push("No unique main/hero/cover filename was found.");
  }

  const canAutoMatch = images.length > 0 && Boolean(mainCandidate) && !containsOldBrand && !containsContactDetails;
  const mappingMain = protectedStatus ? previous?.main_image ?? "" : mainCandidate ?? "";
  const mappingGallery = protectedStatus ? previous?.gallery_images ?? "" : galleryCandidates.join("|");

  mappingRows.push(
    csvRow([
      product.sku,
      product.slug,
      product.product_name,
      product.category,
      sourceFolder,
      mappingMain,
      mappingGallery,
      protectedStatus ? previous?.main_alt ?? "" : "",
      protectedStatus ? previous?.gallery_alt ?? "" : "",
      suggestedStatus,
      notes.join(" ")
    ])
  );

  reportRows.push(
    csvRow([
      product.sku,
      product.slug,
      product.product_name,
      product.category,
      sourceFolder,
      images.length,
      Boolean(mainCandidate),
      galleryCandidates.length > 0,
      canAutoMatch,
      containsOldBrand,
      containsContactDetails,
      suggestedStatus,
      notes.join(" ")
    ])
  );
}

fs.mkdirSync(path.dirname(mappingPath), { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(mappingPath, `${mappingRows.join("\n")}\n`, "utf8");
fs.writeFileSync(reportPath, `${reportRows.join("\n")}\n`, "utf8");

console.log(`Published products: ${products.length}`);
console.log(`Imported image files: ${importedImageCount}`);
console.log(`Products missing source images: ${missingProductCount}`);
console.log(`Products requiring review: ${reviewProductCount}`);
console.log(`Products with blocked brand/domain filenames: ${blockedBrandProductCount}`);
console.log(`Products with contact markers in filenames: ${contactProductCount}`);
console.log(`Images outside a published product slug folder: ${orphanImages.length}`);
for (const orphanImage of orphanImages) console.log(`REVIEW orphan image: ${orphanImage}`);
console.log(`Wrote ${toPosix(path.relative(projectRoot, mappingPath))}.`);
console.log(`Wrote ${toPosix(path.relative(projectRoot, reportPath))}.`);

