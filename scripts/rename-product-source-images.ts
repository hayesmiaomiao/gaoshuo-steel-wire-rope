import fs from "node:fs";
import path from "node:path";
import { getPublishedProducts } from "../src/lib/products/data";

const projectRoot = process.cwd();
const importRoot = path.join(projectRoot, "image-import");
const reportsRoot = path.join(projectRoot, "reports");
const planPath = path.join(reportsRoot, "product-image-rename-plan.csv");
const historyPath = path.join(reportsRoot, "product-image-rename-history.csv");
const auditPath = path.join(reportsRoot, "product-image-renaming-audit.md");

const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp", ".avif"]);
const normalizedNamePattern = /^(main|detail|terminal|construction|application|packaging|drawing|review)-original-(\d{2,})\.(jpg|jpeg|png|webp|tif|tiff|bmp|avif)$/i;

const planHeaders = [
  "batch_id",
  "category",
  "product_slug",
  "product_name",
  "source_path",
  "source_filename",
  "target_path",
  "target_filename",
  "detected_type",
  "confidence",
  "width",
  "height",
  "file_size_bytes",
  "extension",
  "contains_old_brand_filename",
  "contains_contact_filename",
  "action",
  "status",
  "notes"
] as const;

const historyHeaders = [
  "batch_id",
  "executed_at",
  "category",
  "product_slug",
  "old_path",
  "old_filename",
  "new_path",
  "new_filename",
  "result",
  "error_message"
] as const;

type ImageType = "main" | "detail" | "terminal" | "construction" | "application" | "packaging" | "drawing" | "review";
type Confidence = "high" | "medium" | "low";
type Action = "rename" | "keep" | "review" | "skip" | "error";
type PlanStatus = "planned" | "renamed" | "kept" | "review" | "skipped" | "failed" | "rolled-back";

type ImageMetadata = {
  width: number;
  height: number;
};

type ProductIdentity = {
  category: string;
  slug: string;
  name: string;
  directory: string;
};

type PlanRow = {
  batch_id: string;
  category: string;
  product_slug: string;
  product_name: string;
  source_path: string;
  source_filename: string;
  target_path: string;
  target_filename: string;
  detected_type: ImageType;
  confidence: Confidence;
  width: string;
  height: string;
  file_size_bytes: string;
  extension: string;
  contains_old_brand_filename: string;
  contains_contact_filename: string;
  action: Action;
  status: PlanStatus;
  notes: string;
};

type HistoryRow = {
  batch_id: string;
  executed_at: string;
  category: string;
  product_slug: string;
  old_path: string;
  old_filename: string;
  new_path: string;
  new_filename: string;
  result: string;
  error_message: string;
};

type Classification = {
  type: ImageType;
  confidence: Confidence;
  reason: string;
};

const keywordRules: Array<{ type: Exclude<ImageType, "review">; patterns: RegExp[] }> = [
  {
    type: "main",
    patterns: [/\bmain\b/i, /\bprimary\b/i, /\bcover\b/i, /\bhero\b/i, /\bproduct\b/i, /\bfront\b/i, /主图/u, /首图/u, /封面/u]
  },
  {
    type: "detail",
    patterns: [/\bdetail\b/i, /\bclose\b/i, /\bclose[\s_-]*up\b/i, /\bsurface\b/i, /\bcoating\b/i, /\bwire\b/i, /\brope\b/i, /细节/u, /特写/u, /表面/u, /钢丝/u, /绳体/u]
  },
  {
    type: "terminal",
    patterns: [/\bterminal\b/i, /\bhook\b/i, /\bcarabiner\b/i, /\bsnap\b/i, /\beye\b/i, /\bloop\b/i, /\bsleeve\b/i, /\bthimble\b/i, /\bball\b/i, /\bthread\b/i, /\bfitting\b/i, /\bgripper\b/i, /\bstop\b/i, /\bend\b/i, /端头/u, /挂钩/u, /卡扣/u, /套管/u, /鸡心环/u, /球头/u, /螺纹/u, /接头/u, /压接/u]
  },
  {
    type: "construction",
    patterns: [/\bconstruction\b/i, /\bstructure\b/i, /\bstrand\b/i, /\bcross[\s_-]*section\b/i, /\bsection\b/i, /\bassembly\b/i, /结构/u, /截面/u, /股绳/u, /组件结构/u]
  },
  {
    type: "application",
    patterns: [/\bapplication\b/i, /\busage\b/i, /\binstallation\b/i, /\binstalled\b/i, /\bscene\b/i, /\bequipment\b/i, /使用/u, /应用/u, /安装/u, /场景/u, /设备/u]
  },
  {
    type: "packaging",
    patterns: [/\bpackage\b/i, /\bpackaging\b/i, /\bbox\b/i, /\bcarton\b/i, /\bpallet\b/i, /\breel\b/i, /\bspool\b/i, /包装/u, /纸箱/u, /托盘/u, /卷盘/u, /线轴/u]
  },
  {
    type: "drawing",
    patterns: [/\bdrawing\b/i, /\bdiagram\b/i, /\bdimensions?\b/i, /\bsize\b/i, /\btechnical\b/i, /\bcad\b/i, /\bsketch\b/i, /图纸/u, /尺寸/u, /线稿/u, /技术图/u]
  }
];

const oldBrandPatterns = [
  new RegExp(["just", "wire", "rope"].join("[\\s._-]*"), "i"),
  new RegExp(["wire", "rope", "assy"].join("[\\s._-]*"), "i"),
  new RegExp(["guo", "feng"].join("[\\s._-]*"), "i"),
  new RegExp(["as", "tro"].join(""), "i")
];

const contactPatterns = [
  /\bemail\b/i,
  /\bmail\b/i,
  /\bphone\b/i,
  /\btel(?:ephone)?\b/i,
  /\bwhats[\s._-]*app\b/i,
  /\bwechat\b/i,
  /微信/u,
  /电话/u,
  /邮箱/u,
  /网址/u,
  /\bwww\b/i,
  /\.com\b/i,
  /\.cn\b/i
];

function csvCell(value: string | number | boolean): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csvRow(values: Array<string | number | boolean>): string {
  return values.map(csvCell).join(",");
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
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
      cells.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  cells.push(current);
  return cells;
}

function readCsv<T extends Record<string, string>>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0] ?? "");
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])) as T;
  });
}

function writePlan(rows: PlanRow[]): void {
  const lines = [csvRow([...planHeaders])];
  for (const row of rows) lines.push(csvRow(planHeaders.map((header) => row[header])));
  fs.mkdirSync(reportsRoot, { recursive: true });
  fs.writeFileSync(planPath, `${lines.join("\n")}\n`, "utf8");
}

function ensureHistoryFile(): void {
  fs.mkdirSync(reportsRoot, { recursive: true });
  if (!fs.existsSync(historyPath)) fs.writeFileSync(historyPath, `${csvRow([...historyHeaders])}\n`, "utf8");
}

function appendHistory(rows: HistoryRow[]): void {
  ensureHistoryFile();
  if (rows.length === 0) return;
  const lines = rows.map((row) => csvRow(historyHeaders.map((header) => row[header])));
  fs.appendFileSync(historyPath, `${lines.join("\n")}\n`, "utf8");
}

function relativeDirectory(directory: string): string {
  return `${path.relative(projectRoot, directory).split(path.sep).join("/")}/`;
}

function resolveSafeRelativeDirectory(relativePath: string): string | undefined {
  const resolved = path.resolve(projectRoot, relativePath);
  if (resolved !== importRoot && !resolved.startsWith(`${importRoot}${path.sep}`)) return undefined;
  return resolved;
}

function isIgnoredName(name: string): boolean {
  const lower = name.toLowerCase();
  return name.startsWith(".") || name.startsWith("~") || lower === "readme.txt" || lower === "thumbs.db" || lower.endsWith(".tmp") || lower.endsWith(".part") || lower.endsWith(".crdownload");
}

function readUInt24LE(buffer: Buffer, offset: number): number {
  return buffer[offset] + (buffer[offset + 1] << 8) + (buffer[offset + 2] << 16);
}

function readPngMetadata(buffer: Buffer): ImageMetadata | undefined {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(signature)) return undefined;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readJpegMetadata(buffer: Buffer): ImageMetadata | undefined {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return undefined;
  const startOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > buffer.length) return undefined;
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) return undefined;
    if (startOfFrameMarkers.has(marker) && length >= 7) {
      return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
    }
    offset += length;
  }
  return undefined;
}

function readWebpMetadata(buffer: Buffer): ImageMetadata | undefined {
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return undefined;
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkType = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;
    if (dataOffset + chunkSize > buffer.length) return undefined;
    if (chunkType === "VP8X" && chunkSize >= 10) {
      return { width: readUInt24LE(buffer, dataOffset + 4) + 1, height: readUInt24LE(buffer, dataOffset + 7) + 1 };
    }
    if (chunkType === "VP8L" && chunkSize >= 5 && buffer[dataOffset] === 0x2f) {
      const b1 = buffer[dataOffset + 1];
      const b2 = buffer[dataOffset + 2];
      const b3 = buffer[dataOffset + 3];
      const b4 = buffer[dataOffset + 4];
      return {
        width: 1 + b1 + ((b2 & 0x3f) << 8),
        height: 1 + ((b2 & 0xc0) >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10)
      };
    }
    if (chunkType === "VP8 " && chunkSize >= 10 && buffer[dataOffset + 3] === 0x9d && buffer[dataOffset + 4] === 0x01 && buffer[dataOffset + 5] === 0x2a) {
      return { width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff, height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff };
    }
    offset = dataOffset + chunkSize + (chunkSize % 2);
  }
  return undefined;
}

function readBmpMetadata(buffer: Buffer): ImageMetadata | undefined {
  if (buffer.length < 26 || buffer.toString("ascii", 0, 2) !== "BM") return undefined;
  return { width: Math.abs(buffer.readInt32LE(18)), height: Math.abs(buffer.readInt32LE(22)) };
}

function readTiffMetadata(buffer: Buffer): ImageMetadata | undefined {
  if (buffer.length < 16) return undefined;
  const byteOrder = buffer.toString("ascii", 0, 2);
  const littleEndian = byteOrder === "II";
  if (!littleEndian && byteOrder !== "MM") return undefined;
  const read16 = (offset: number) => littleEndian ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset);
  const read32 = (offset: number) => littleEndian ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset);
  if (read16(2) !== 42) return undefined;
  const ifdOffset = read32(4);
  if (ifdOffset + 2 > buffer.length) return undefined;
  const entryCount = read16(ifdOffset);
  let width = 0;
  let height = 0;
  for (let index = 0; index < entryCount; index += 1) {
    const entryOffset = ifdOffset + 2 + index * 12;
    if (entryOffset + 12 > buffer.length) return undefined;
    const tag = read16(entryOffset);
    const type = read16(entryOffset + 2);
    const count = read32(entryOffset + 4);
    if ((tag === 256 || tag === 257) && count >= 1) {
      const value = type === 3 ? read16(entryOffset + 8) : type === 4 ? read32(entryOffset + 8) : 0;
      if (tag === 256) width = value;
      if (tag === 257) height = value;
    }
  }
  return width > 0 && height > 0 ? { width, height } : undefined;
}

function readAvifMetadata(buffer: Buffer): ImageMetadata | undefined {
  if (buffer.length < 24 || buffer.toString("ascii", 4, 8) !== "ftyp") return undefined;
  for (let offset = 0; offset + 16 <= buffer.length; offset += 1) {
    if (buffer.toString("ascii", offset, offset + 4) === "ispe") {
      const width = buffer.readUInt32BE(offset + 8);
      const height = buffer.readUInt32BE(offset + 12);
      if (width > 0 && height > 0) return { width, height };
    }
  }
  return undefined;
}

function readImageMetadata(filePath: string, extension: string): ImageMetadata | undefined {
  const buffer = fs.readFileSync(filePath);
  if (extension === ".png") return readPngMetadata(buffer);
  if (extension === ".jpg" || extension === ".jpeg") return readJpegMetadata(buffer);
  if (extension === ".webp") return readWebpMetadata(buffer);
  if (extension === ".bmp") return readBmpMetadata(buffer);
  if (extension === ".tif" || extension === ".tiff") return readTiffMetadata(buffer);
  if (extension === ".avif") return readAvifMetadata(buffer);
  return undefined;
}

function classifyFile(fileName: string): Classification {
  const normalizedMatch = normalizedNamePattern.exec(fileName);
  if (normalizedMatch) return { type: normalizedMatch[1].toLowerCase() as ImageType, confidence: "high", reason: "Already uses the approved source-image naming pattern." };
  const baseName = path.basename(fileName, path.extname(fileName)).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[._$]+/g, " ").replace(/\d{5,}/g, " ");
  for (const rule of keywordRules) {
    const matched = rule.patterns.find((pattern) => pattern.test(baseName));
    if (matched) return { type: rule.type, confidence: "medium", reason: `Detected ${rule.type} from an approved filename keyword; image content was not OCR-checked.` };
  }
  return { type: "review", confidence: "low", reason: "No reliable filename keyword; dimensions alone are insufficient to confirm visible content or a main image." };
}

function containsOldBrand(fileName: string): boolean {
  return oldBrandPatterns.some((pattern) => pattern.test(fileName));
}

function containsContact(fileName: string): boolean {
  return contactPatterns.some((pattern) => pattern.test(fileName));
}

function generateBatchId(): string {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${stamp}-${suffix}`;
}

function getProducts(): ProductIdentity[] {
  return getPublishedProducts().map((product) => ({
    category: product.category,
    slug: product.slug,
    name: product.product_name,
    directory: path.join(importRoot, product.category, product.slug)
  }));
}

function collectProductImages(product: ProductIdentity): fs.Dirent[] {
  if (!fs.existsSync(product.directory)) return [];
  return fs.readdirSync(product.directory, { withFileTypes: true }).filter((entry) => entry.isFile() && !isIgnoredName(entry.name) && supportedExtensions.has(path.extname(entry.name).toLowerCase()));
}

function nextTargetFileName(type: ImageType, extension: string, occupiedNumbers: Map<ImageType, Set<number>>): string {
  const occupied = occupiedNumbers.get(type) ?? new Set<number>();
  occupiedNumbers.set(type, occupied);
  let number = 1;
  while (occupied.has(number)) number += 1;
  occupied.add(number);
  return `${type}-original-${String(number).padStart(2, "0")}${extension}`;
}

function buildPlan(): { rows: PlanRow[]; seriousErrors: string[] } {
  const batchId = generateBatchId();
  const rows: PlanRow[] = [];
  const seriousErrors: string[] = [];
  for (const product of getProducts()) {
    const directoryEntries = collectProductImages(product).sort((left, right) => left.name.localeCompare(right.name));
    const occupiedNumbers = new Map<ImageType, Set<number>>();
    for (const entry of directoryEntries) {
      const match = normalizedNamePattern.exec(entry.name);
      if (!match) continue;
      const type = match[1].toLowerCase() as ImageType;
      const occupied = occupiedNumbers.get(type) ?? new Set<number>();
      occupied.add(Number(match[2]));
      occupiedNumbers.set(type, occupied);
    }

    for (const entry of directoryEntries) {
      const filePath = path.join(product.directory, entry.name);
      const extension = path.extname(entry.name).toLowerCase();
      const sourceDirectory = relativeDirectory(product.directory);
      const classification = classifyFile(entry.name);
      const normalizedMatch = normalizedNamePattern.exec(entry.name);
      const oldBrand = containsOldBrand(entry.name);
      const contact = containsContact(entry.name);
      const stat = fs.statSync(filePath);
      const notes = [classification.reason];
      let metadata: ImageMetadata | undefined;
      let action: Action;
      let status: PlanStatus;
      let targetFileName = entry.name;

      if (stat.size === 0) {
        action = "error";
        status = "failed";
        notes.push("Zero-byte image cannot be processed.");
        seriousErrors.push(`Zero-byte image: ${sourceDirectory}${entry.name}`);
      } else {
        try {
          metadata = readImageMetadata(filePath, extension);
        } catch (error) {
          notes.push(`Image header read failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        if (!metadata || metadata.width <= 0 || metadata.height <= 0) {
          action = "error";
          status = "failed";
          notes.push("Unsupported or damaged image header; dimensions could not be verified.");
          seriousErrors.push(`Damaged or unrecognized image: ${sourceDirectory}${entry.name}`);
        } else if (normalizedMatch && entry.name === entry.name.toLowerCase()) {
          action = "keep";
          status = "kept";
          targetFileName = entry.name;
        } else if (classification.confidence === "low") {
          action = "review";
          status = "review";
          targetFileName = nextTargetFileName("review", extension, occupiedNumbers);
          notes.push("Manual type review is required; this file will not be renamed automatically.");
        } else {
          action = "rename";
          status = "planned";
          targetFileName = normalizedMatch
            ? `${normalizedMatch[1].toLowerCase()}-original-${normalizedMatch[2]}${extension}`
            : nextTargetFileName(classification.type, extension, occupiedNumbers);
        }
      }

      if (oldBrand || contact) notes.push("The filename marker will be removed by renaming, but the visible image content still requires manual inspection for branding, contact details, and watermarks.");
      const targetFilePath = path.join(product.directory, targetFileName);
      if (action === "rename" && targetFilePath.toLowerCase() !== filePath.toLowerCase() && fs.existsSync(targetFilePath)) {
        action = "error";
        status = "failed";
        notes.push("Target path already exists; no rename will be attempted.");
        seriousErrors.push(`Target already exists: ${sourceDirectory}${targetFileName}`);
      }

      rows.push({
        batch_id: batchId,
        category: product.category,
        product_slug: product.slug,
        product_name: product.name,
        source_path: sourceDirectory,
        source_filename: entry.name,
        target_path: sourceDirectory,
        target_filename: targetFileName,
        detected_type: classification.type,
        confidence: classification.confidence,
        width: metadata ? String(metadata.width) : "",
        height: metadata ? String(metadata.height) : "",
        file_size_bytes: String(stat.size),
        extension,
        contains_old_brand_filename: String(oldBrand),
        contains_contact_filename: String(contact),
        action,
        status,
        notes: notes.join(" ")
      });
    }
  }

  const targetKeys = new Map<string, number>();
  for (const row of rows.filter((candidate) => candidate.action === "rename")) {
    const key = `${row.target_path}${row.target_filename}`.toLowerCase();
    targetKeys.set(key, (targetKeys.get(key) ?? 0) + 1);
  }
  for (const [target, count] of targetKeys) if (count > 1) seriousErrors.push(`Duplicate planned target (${count}): ${target}`);
  return { rows, seriousErrors };
}

function safeRename(source: string, target: string): void {
  if (!fs.existsSync(source)) throw new Error("Source file does not exist.");
  if (source !== target && fs.existsSync(target)) throw new Error("Target file already exists.");
  if (source === target) return;
  if (source.toLowerCase() === target.toLowerCase()) {
    const temporary = `${source}.rename-${process.pid}-${Math.random().toString(36).slice(2)}`;
    fs.renameSync(source, temporary);
    try {
      fs.renameSync(temporary, target);
    } catch (error) {
      if (fs.existsSync(temporary) && !fs.existsSync(source)) fs.renameSync(temporary, source);
      throw error;
    }
  } else {
    fs.renameSync(source, target);
  }
  if (!fs.existsSync(target)) throw new Error("Target file was not found after rename.");
}

function executePlan(): { rows: PlanRow[]; seriousErrors: string[] } {
  const rows = readCsv<PlanRow>(planPath);
  if (rows.length === 0) throw new Error("Rename plan is missing or empty. Run images:rename:plan first.");
  const batchIds = new Set(rows.map((row) => row.batch_id));
  if (batchIds.size !== 1) throw new Error("Rename plan contains multiple batch IDs.");
  const duplicateTargets = new Set<string>();
  const seenTargets = new Set<string>();
  const seriousErrors: string[] = [];

  for (const row of rows.filter((candidate) => candidate.action === "rename" && (candidate.confidence === "high" || candidate.confidence === "medium"))) {
    const key = `${row.target_path}${row.target_filename}`.toLowerCase();
    if (seenTargets.has(key)) duplicateTargets.add(key);
    seenTargets.add(key);
    const sourceDirectory = resolveSafeRelativeDirectory(row.source_path);
    const targetDirectory = resolveSafeRelativeDirectory(row.target_path);
    const unsafeFileName = path.basename(row.source_filename) !== row.source_filename || path.basename(row.target_filename) !== row.target_filename;
    if (!sourceDirectory || !targetDirectory || sourceDirectory !== targetDirectory || unsafeFileName) seriousErrors.push(`Unsafe or conflicting path in plan: ${row.source_path}${row.source_filename}`);
    else {
      const source = path.join(sourceDirectory, row.source_filename);
      const target = path.join(targetDirectory, row.target_filename);
      if (!fs.existsSync(source)) seriousErrors.push(`Source missing before execution: ${row.source_path}${row.source_filename}`);
      if (source.toLowerCase() !== target.toLowerCase() && fs.existsSync(target)) seriousErrors.push(`Target occupied before execution: ${row.target_path}${row.target_filename}`);
    }
  }
  for (const duplicate of duplicateTargets) seriousErrors.push(`Duplicate target in plan: ${duplicate}`);
  if (rows.some((row) => row.file_size_bytes === "0" || row.action === "error" || row.status === "failed")) seriousErrors.push("Plan contains a zero-byte, damaged, or failed image row.");
  if (seriousErrors.length > 0) return { rows, seriousErrors: [...new Set(seriousErrors)] };

  const historyRows: HistoryRow[] = [];
  for (const row of rows) {
    if (row.action !== "rename" || (row.confidence !== "high" && row.confidence !== "medium")) continue;
    const sourceDirectory = resolveSafeRelativeDirectory(row.source_path);
    const targetDirectory = resolveSafeRelativeDirectory(row.target_path);
    if (!sourceDirectory || !targetDirectory) continue;
    const source = path.join(sourceDirectory, row.source_filename);
    const target = path.join(targetDirectory, row.target_filename);
    let result = "renamed";
    let errorMessage = "";
    try {
      safeRename(source, target);
      row.status = "renamed";
    } catch (error) {
      result = "failed";
      errorMessage = error instanceof Error ? error.message : String(error);
      row.status = "failed";
      row.notes = `${row.notes} Rename failed: ${errorMessage}`.trim();
      seriousErrors.push(`${row.source_path}${row.source_filename}: ${errorMessage}`);
    }
    historyRows.push({
      batch_id: row.batch_id,
      executed_at: new Date().toISOString(),
      category: row.category,
      product_slug: row.product_slug,
      old_path: row.source_path,
      old_filename: row.source_filename,
      new_path: row.target_path,
      new_filename: row.target_filename,
      result,
      error_message: errorMessage
    });
  }
  appendHistory(historyRows);
  writePlan(rows);
  return { rows, seriousErrors };
}

function rollbackLatest(): { rows: PlanRow[]; seriousErrors: string[]; batchId: string } {
  const candidates = activeHistoryRenames();
  const batchId = candidates.at(-1)?.batch_id;
  if (!batchId) throw new Error("No successful rename batch is available to roll back.");
  const batchRows = candidates.filter((row) => row.batch_id === batchId).reverse();
  const seriousErrors: string[] = [];
  const rollbackHistory: HistoryRow[] = [];

  for (const item of batchRows) {
    const oldDirectory = resolveSafeRelativeDirectory(item.old_path);
    const newDirectory = resolveSafeRelativeDirectory(item.new_path);
    let result = "rolled-back";
    let errorMessage = "";
    const unsafeFileName = path.basename(item.old_filename) !== item.old_filename || path.basename(item.new_filename) !== item.new_filename;
    if (!oldDirectory || !newDirectory || unsafeFileName) {
      result = "rollback-failed";
      errorMessage = "Unsafe history path.";
    } else {
      const current = path.join(newDirectory, item.new_filename);
      const restored = path.join(oldDirectory, item.old_filename);
      try {
        if (!fs.existsSync(current)) throw new Error("Renamed file is missing.");
        if (fs.existsSync(restored)) throw new Error("Original filename is already occupied.");
        safeRename(current, restored);
      } catch (error) {
        result = "rollback-failed";
        errorMessage = error instanceof Error ? error.message : String(error);
      }
    }
    if (result === "rollback-failed") seriousErrors.push(`${item.new_path}${item.new_filename}: ${errorMessage}`);
    rollbackHistory.push({ ...item, executed_at: new Date().toISOString(), result, error_message: errorMessage });
  }
  appendHistory(rollbackHistory);
  const planRows = readCsv<PlanRow>(planPath);
  for (const row of planRows) if (row.batch_id === batchId && row.status === "renamed") row.status = "rolled-back";
  if (planRows.length > 0) writePlan(planRows);
  return { rows: planRows, seriousErrors, batchId };
}

function scanUnsupportedAndZeroByte(): { unsupported: string[]; zeroByte: string[] } {
  const unsupported: string[] = [];
  const zeroByte: string[] = [];
  if (!fs.existsSync(importRoot)) return { unsupported, zeroByte };
  const pending = [importRoot];
  while (pending.length > 0) {
    const directory = pending.pop();
    if (!directory) continue;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name === "rejected" || entry.name === "unmatched" || isIgnoredName(entry.name)) continue;
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) pending.push(entryPath);
      else if (entry.isFile()) {
        const extension = path.extname(entry.name).toLowerCase();
        if (!supportedExtensions.has(extension)) unsupported.push(path.relative(projectRoot, entryPath).split(path.sep).join("/"));
        else if (fs.statSync(entryPath).size === 0) zeroByte.push(path.relative(projectRoot, entryPath).split(path.sep).join("/"));
      }
    }
  }
  return { unsupported, zeroByte };
}

function activeHistoryRenames(): HistoryRow[] {
  const history = readCsv<HistoryRow>(historyPath);
  const historyKey = (row: HistoryRow) => [row.batch_id, row.old_path, row.old_filename, row.new_path, row.new_filename].join("\u0000");
  const rolledBackFiles = new Set(history.filter((row) => row.result === "rolled-back").map(historyKey));
  return history.filter((row) => row.result === "renamed" && !rolledBackFiles.has(historyKey(row)));
}

function writeAudit(rows: PlanRow[], seriousErrors: string[], operation: string): void {
  const products = getProducts();
  const activeHistory = activeHistoryRenames();
  const scan = scanUnsupportedAndZeroByte();
  const actualFiles = products.flatMap((product) => collectProductImages(product).map((entry) => ({ product, name: entry.name })));
  const normalizedFiles = actualFiles.filter((item) => normalizedNamePattern.test(item.name));
  const mainProducts = products.filter((product) => collectProductImages(product).some((entry) => /^main-original-\d{2,}\./i.test(entry.name)));
  const multipleMainProducts = products.filter((product) => collectProductImages(product).filter((entry) => /^main-original-\d{2,}\./i.test(entry.name)).length > 1);
  const reviewRows = rows.filter((row) => row.action === "review" || row.detected_type === "review");
  const onlyReviewProducts = products.filter((product) => {
    const productRows = rows.filter((row) => row.product_slug === product.slug);
    return productRows.length > 0 && productRows.every((row) => row.detected_type === "review");
  });
  const brandHistory = activeHistory.filter((row) => containsOldBrand(row.old_filename));
  const contactHistory = activeHistory.filter((row) => containsContact(row.old_filename));
  const brandCurrent = actualFiles.filter((item) => containsOldBrand(item.name));
  const contactCurrent = actualFiles.filter((item) => containsContact(item.name));
  const brandFiles = [...new Set([...brandHistory.map((row) => `${row.old_path}${row.old_filename}`), ...brandCurrent.map((item) => `${relativeDirectory(item.product.directory)}${item.name}`)])];
  const contactFiles = [...new Set([...contactHistory.map((row) => `${row.old_path}${row.old_filename}`), ...contactCurrent.map((item) => `${relativeDirectory(item.product.directory)}${item.name}`)])];
  const damaged = rows.filter((row) => row.action === "error" && row.notes.includes("damaged"));
  const typeCounts = new Map<ImageType, number>();
  for (const row of rows) typeCounts.set(row.detected_type, (typeCounts.get(row.detected_type) ?? 0) + 1);
  const residualChinese = actualFiles.filter((item) => /[\u3400-\u9fff]/u.test(item.name));
  const residualSpaces = actualFiles.filter((item) => /\s/u.test(item.name));
  const residualUppercaseExtension = actualFiles.filter((item) => path.extname(item.name) !== path.extname(item.name).toLowerCase());
  const processReady = mainProducts.filter((product) => !rows.some((row) => row.product_slug === product.slug && (row.action === "review" || row.action === "error")));
  const manualProducts = products.filter((product) => !mainProducts.some((candidate) => candidate.slug === product.slug) || rows.some((row) => row.product_slug === product.slug && row.action === "review"));

  const lines = [
    "# Product Source Image Renaming Audit",
    "",
    `- Generated: ${new Date().toISOString()}`,
    `- Operation: ${operation}`,
    `- Scanned product directories: ${products.length}`,
    `- Scanned supported images: ${actualFiles.length}`,
    `- Unsupported non-image files: ${scan.unsupported.length}`,
    `- Zero-byte images: ${scan.zeroByte.length}`,
    `- Damaged or unrecognized images: ${damaged.length}`,
    `- Correctly normalized images: ${normalizedFiles.length}`,
    `- Successfully renamed images in active history: ${activeHistory.length}`,
    `- Kept images in current plan: ${rows.filter((row) => row.action === "keep").length}`,
    `- Review images in current plan: ${reviewRows.length}`,
    `- Failed images in current plan: ${rows.filter((row) => row.status === "failed").length}`,
    `- Products with a main image: ${mainProducts.length}`,
    `- Products without a main image: ${products.length - mainProducts.length}`,
    `- Products with multiple main candidates: ${multipleMainProducts.length}`,
    `- Products with only review images: ${onlyReviewProducts.length}`,
    `- Old-brand filenames detected before or after renaming: ${brandFiles.length}`,
    `- Contact-detail filenames detected before or after renaming: ${contactFiles.length}`,
    `- Residual Chinese filenames: ${residualChinese.length}`,
    `- Residual filenames with spaces: ${residualSpaces.length}`,
    `- Residual uppercase extensions: ${residualUppercaseExtension.length}`,
    `- Serious errors: ${seriousErrors.length}`,
    "",
    "## Image types in current plan",
    "",
    ...(["main", "detail", "terminal", "construction", "application", "packaging", "drawing", "review"] as ImageType[]).map((type) => `- ${type}: ${typeCounts.get(type) ?? 0}`),
    "",
    "## Products that can enter image processing",
    "",
    ...(processReady.length > 0 ? processReady.map((product) => `- ${product.slug}`) : ["- None"]),
    "",
    "## Products still requiring manual review",
    "",
    ...(manualProducts.length > 0 ? manualProducts.map((product) => `- ${product.slug}`) : ["- None"]),
    "",
    "## Files requiring manual type review",
    "",
    ...(reviewRows.length > 0 ? reviewRows.map((row) => `- ${row.source_path}${row.source_filename} -> suggested ${row.target_filename}`) : ["- None"]),
    "",
    "## Old-brand filenames requiring visible-content inspection",
    "",
    ...(brandFiles.length > 0 ? brandFiles.map((file) => `- ${file}`) : ["- None"]),
    "",
    "## Contact-detail filenames requiring visible-content inspection",
    "",
    ...(contactFiles.length > 0 ? contactFiles.map((file) => `- ${file}`) : ["- None"]),
    "",
    "## Serious errors",
    "",
    ...(seriousErrors.length > 0 ? seriousErrors.map((error) => `- ${error}`) : ["- None"]),
    ""
  ];
  fs.mkdirSync(reportsRoot, { recursive: true });
  fs.writeFileSync(auditPath, lines.join("\n"), "utf8");
}

function summarize(rows: PlanRow[], seriousErrors: string[], operation: string): void {
  console.log(`Operation: ${operation}`);
  console.log(`Plan rows: ${rows.length}`);
  console.log(`Rename: ${rows.filter((row) => row.action === "rename").length}`);
  console.log(`Keep: ${rows.filter((row) => row.action === "keep").length}`);
  console.log(`Review: ${rows.filter((row) => row.action === "review").length}`);
  console.log(`Failed: ${rows.filter((row) => row.status === "failed").length}`);
  console.log(`Serious errors: ${seriousErrors.length}`);
  for (const error of seriousErrors) console.error(error);
  console.log(`Wrote ${path.relative(projectRoot, planPath)}.`);
  console.log(`Wrote ${path.relative(projectRoot, historyPath)}.`);
  console.log(`Wrote ${path.relative(projectRoot, auditPath)}.`);
}

function main(): void {
  ensureHistoryFile();
  const args = new Set(process.argv.slice(2));
  if (args.has("--execute")) {
    const result = executePlan();
    writeAudit(result.rows, result.seriousErrors, "execute");
    summarize(result.rows, result.seriousErrors, "execute");
    if (result.seriousErrors.length > 0) process.exitCode = 1;
    return;
  }
  if (args.has("--rollback-latest")) {
    const result = rollbackLatest();
    writeAudit(result.rows, result.seriousErrors, `rollback ${result.batchId}`);
    summarize(result.rows, result.seriousErrors, `rollback ${result.batchId}`);
    if (result.seriousErrors.length > 0) process.exitCode = 1;
    return;
  }
  const result = buildPlan();
  writePlan(result.rows);
  writeAudit(result.rows, result.seriousErrors, "plan");
  summarize(result.rows, result.seriousErrors, "plan");
  if (result.seriousErrors.length > 0) process.exitCode = 1;
}

main();
