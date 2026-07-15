import { getAllProducts } from "../src/lib/products/data";

const products = getAllProducts();
const byStatus = products.reduce<Record<string, number>>((acc, product) => {
  acc[product.status] = (acc[product.status] ?? 0) + 1;
  return acc;
}, {});

console.log("Product report");
console.log(JSON.stringify({ total: products.length, byStatus }, null, 2));
