import fs from "node:fs";
import path from "node:path";
import { getPublishedProducts } from "../src/lib/products/data";

const projectRoot = process.cwd();
  const productsRoot = path.join(projectRoot, "public", "images", "products");
  const publicRoot = path.join(projectRoot, "public");
  const reportPath = path.join(projectRoot, "reports", "product-image-folders.csv");
  const maxWebpBytes = 500 * 1024;

  const allowedFileNamePattern = /^(?:main|main-alternative-\d{2}|(?:detail|terminal|construction|application|packaging|drawing)-\d{2})\.webp$/;

  const blockedBrandTokens = [
    ["just", "wire", "rope"].join(""),
    ["wire", "rope", "assy"].join(""),
    ["guo", "feng"].join(""),
    ["astro", "wire", "rope"].join("")
  ];

  const blockedDomainTokens = [
    [["just", "wire", "rope"].join(""), "com"].join(""),
    [["wire", "rope", "assy"].join(""), "com"].join("")
  ];

  function csvCell(value = "") {
    return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
  }

  function csvRow(values = [""]) {
    return values.map(csvCell).join(",");
  }

  function normalizeDirectoryToken(value = "") {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function isExternalReference(value = "") {
    return /^(?:https?:)?\/\//i.test(value);
  }

  function resolvePublicReference(reference = "") {
    if (!reference.startsWith("/")) return undefined;
    const resolved = path.resolve(publicRoot, reference.replace(/^\/+/, ""));
    if (resolved !== publicRoot && !resolved.startsWith(`${publicRoot}${path.sep}`)) return undefined;
    return resolved;
  }

  const products = getPublishedProducts().filter((product) => product.publishableBoolean);
  const expectedSlugs = new Set(products.map((product) => product.slug));
  const errors = [""];
  errors.pop();
  const globalDirectoryIssues = {
    invalidName: 0,
    orphan: 0,
    originalBrand: 0,
    originalDomain: 0
  };
  let looseRootFiles = 0;
  let invalidFileCount = 0;
  let externalReferenceCount = 0;
  let imageImportReferenceCount = 0;
  let missingReferenceCount = 0;

  if (!fs.existsSync(productsRoot)) {
    errors.push("Missing public/images/products directory.");
  }

  const rootEntries = fs.existsSync(productsRoot)
    ? fs.readdirSync(productsRoot, { withFileTypes: true })
    : [];

  for (const entry of rootEntries) {
    if (entry.isFile()) {
      looseRootFiles += 1;
      errors.push(`Loose file in public/images/products root: ${entry.name}`);
      continue;
    }
    if (!entry.isDirectory()) continue;

    let directoryInvalid = false;
    if (/[\u3400-\u9fff]/u.test(entry.name)) {
      errors.push(`Product directory contains Chinese characters: ${entry.name}`);
      directoryInvalid = true;
    }
    if (/[A-Z]/.test(entry.name)) {
      errors.push(`Product directory contains uppercase letters: ${entry.name}`);
      directoryInvalid = true;
    }
    if (/\s/.test(entry.name)) {
      errors.push(`Product directory contains spaces: ${entry.name}`);
      directoryInvalid = true;
    }
    if (directoryInvalid) globalDirectoryIssues.invalidName += 1;

    if (!expectedSlugs.has(entry.name)) {
      globalDirectoryIssues.orphan += 1;
      errors.push(`Product directory does not match a published product slug: ${entry.name}`);
    }

    const normalized = normalizeDirectoryToken(entry.name);
    if (blockedBrandTokens.some((token) => normalized.includes(token))) {
      globalDirectoryIssues.originalBrand += 1;
      errors.push(`Product directory contains a blocked source brand token: ${entry.name}`);
    }
    if (blockedDomainTokens.some((token) => normalized.includes(token))) {
      globalDirectoryIssues.originalDomain += 1;
      errors.push(`Product directory contains a blocked source domain token: ${entry.name}`);
    }
  }

  const reportRows = [
    csvRow([
      "sku",
      "product_slug",
      "product_name",
      "expected_folder",
      "folder_exists",
      "unexpected_files",
      "invalid_filenames",
      "external_image_reference",
      "placeholder_status",
      "status",
      "notes"
    ])
  ];

  for (const product of products) {
    const expectedFolder = path.join(productsRoot, product.slug);
    const expectedFolderRelative = `public/images/products/${product.slug}/`;
    const folderExists = fs.existsSync(expectedFolder) && fs.statSync(expectedFolder).isDirectory();
    const unexpectedFiles = [""];
    unexpectedFiles.pop();
    const invalidFileNames = [""];
    invalidFileNames.pop();
    const rowNotes = [""];
    rowNotes.pop();

    if (!folderExists) {
      errors.push(`Missing formal product image directory: ${expectedFolderRelative}`);
      rowNotes.push("Formal product image directory is missing.");
    } else {
      for (const entry of fs.readdirSync(expectedFolder, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          unexpectedFiles.push(`${entry.name}/`);
          errors.push(`Nested directory is not allowed in ${expectedFolderRelative}: ${entry.name}`);
          continue;
        }
        if (!entry.isFile()) continue;

        const filePath = path.join(expectedFolder, entry.name);
        const extension = path.extname(entry.name).toLowerCase();

        if (extension !== ".webp") {
          unexpectedFiles.push(entry.name);
          errors.push(`Unsupported formal image format in ${expectedFolderRelative}: ${entry.name}`);
        }
        if (!allowedFileNamePattern.test(entry.name)) {
          invalidFileNames.push(entry.name);
          errors.push(`Invalid formal image filename in ${expectedFolderRelative}: ${entry.name}`);
        }
        if (extension === ".webp" && fs.statSync(filePath).size > maxWebpBytes) {
          unexpectedFiles.push(`${entry.name} (>500KB)`);
          errors.push(`WebP exceeds 500KB in ${expectedFolderRelative}: ${entry.name}`);
        }
      }
    }

    invalidFileCount += new Set([...unexpectedFiles, ...invalidFileNames]).size;

    const imageReferences = [product.image, ...product.galleryList].filter(Boolean);
    const externalReferences = imageReferences.filter(isExternalReference);
    const imageImportReferences = imageReferences.filter((reference) =>
      reference.toLowerCase().includes("image-import")
    );
    const missingReferences = [""];
    missingReferences.pop();

    for (const reference of imageReferences) {
      if (isExternalReference(reference) || reference.toLowerCase().includes("image-import")) continue;
      const resolved = resolvePublicReference(reference);
      if (!resolved || !fs.existsSync(resolved)) missingReferences.push(reference);
    }

    if (externalReferences.length > 0) {
      externalReferenceCount += externalReferences.length;
      errors.push(`External image reference for ${product.sku}: ${externalReferences.join(" | ")}`);
      rowNotes.push("External image reference detected.");
    }
    if (imageImportReferences.length > 0) {
      imageImportReferenceCount += imageImportReferences.length;
      errors.push(`image-import reference for ${product.sku}: ${imageImportReferences.join(" | ")}`);
      rowNotes.push("image-import path is referenced by product data.");
    }
    if (missingReferences.length > 0) {
      missingReferenceCount += missingReferences.length;
      errors.push(`Missing image reference for ${product.sku}: ${missingReferences.join(" | ")}`);
      rowNotes.push(`Missing referenced image: ${missingReferences.join(" | ")}`);
    }

    const placeholderStatus = product.image.startsWith("/images/placeholders/")
      ? "placeholder"
      : product.image.startsWith(`/images/products/${product.slug}/`)
        ? "formal"
        : product.image
          ? "other"
          : "missing";

    if (placeholderStatus === "placeholder") {
      rowNotes.push("Using existing placeholder; formal product images are not yet supplied.");
    }

    const rowHasError =
      !folderExists ||
      unexpectedFiles.length > 0 ||
      invalidFileNames.length > 0 ||
      externalReferences.length > 0 ||
      imageImportReferences.length > 0 ||
      missingReferences.length > 0;

    reportRows.push(
      csvRow([
        product.sku,
        product.slug,
        product.product_name,
        expectedFolderRelative,
        String(folderExists),
        [...new Set(unexpectedFiles)].join("|"),
        [...new Set(invalidFileNames)].join("|"),
        externalReferences.join("|"),
        placeholderStatus,
        rowHasError ? "error" : "ready",
        rowNotes.join(" ")
      ])
    );
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${reportRows.join("\n")}\n`, "utf8");

  console.log(`Published and publishable products: ${products.length}`);
  console.log(`Invalid directory names: ${globalDirectoryIssues.invalidName}`);
  console.log(`Orphan directories: ${globalDirectoryIssues.orphan}`);
  console.log(`Invalid or unexpected files: ${invalidFileCount}`);
  console.log(`Loose root files: ${looseRootFiles}`);
  console.log(`External image references: ${externalReferenceCount}`);
  console.log(`image-import references: ${imageImportReferenceCount}`);
  console.log(`Missing image references: ${missingReferenceCount}`);
  console.log(`Source brand directories: ${globalDirectoryIssues.originalBrand}`);
  console.log(`Source domain directories: ${globalDirectoryIssues.originalDomain}`);
  console.log(`Wrote ${path.relative(projectRoot, reportPath)}.`);

  if (errors.length > 0) {
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log("Product image folder checks passed.");
