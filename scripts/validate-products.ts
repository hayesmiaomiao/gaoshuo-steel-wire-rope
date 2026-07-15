import { readProducts } from "../src/lib/products/data";

const { products, errors } = readProducts();

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${products.length} product records.`);
