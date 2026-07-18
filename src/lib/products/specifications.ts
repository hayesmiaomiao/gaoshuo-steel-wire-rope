import fs from "node:fs";
import path from "node:path";
import { parseCsvRecords } from "@/lib/csv";
import { SPECIFICATION_HEADERS, type SpecificationRecord } from "./specification-model";

const specificationFile = path.join(process.cwd(), "data", "product-specifications.csv");

export type SpecificationReadResult = {
  specifications: SpecificationRecord[];
  errors: string[];
};

export function readProductSpecifications(filePath = specificationFile): SpecificationReadResult {
  if (!fs.existsSync(filePath)) return { specifications: [], errors: [`Specification file does not exist: ${filePath}`] };
  const { headers, records } = parseCsvRecords(fs.readFileSync(filePath, "utf8"));
  const errors: string[] = [];
  const expectedHeaders = [...SPECIFICATION_HEADERS];

  if (headers.length !== expectedHeaders.length || headers.some((header, index) => header !== expectedHeaders[index])) {
    errors.push("Product specification headers do not match the required order.");
  }

  const specifications = records.map((record) =>
    Object.fromEntries(SPECIFICATION_HEADERS.map((field) => [field, record[field] ?? ""])) as SpecificationRecord
  );
  return { specifications, errors };
}

export function getAllProductSpecifications(): SpecificationRecord[] {
  return readProductSpecifications().specifications;
}

export function getProductSpecificationBySku(sku: string): SpecificationRecord | undefined {
  return getAllProductSpecifications().find((specification) => specification.sku === sku);
}

export function publicDocumentExists(documentPath: string): boolean {
  if (!documentPath.startsWith("/documents/")) return false;
  const resolved = path.resolve(process.cwd(), "public", documentPath.replace(/^\//, ""));
  const publicRoot = path.resolve(process.cwd(), "public");
  return resolved.startsWith(`${publicRoot}${path.sep}`) && fs.existsSync(resolved) && fs.statSync(resolved).isFile();
}
