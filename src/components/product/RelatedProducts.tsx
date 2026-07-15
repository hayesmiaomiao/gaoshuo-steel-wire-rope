import type { Product } from "@/lib/products/schema";
import { ProductGrid } from "./ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function RelatedProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-12">
      <SectionHeading title="Related Products" description="Matched by category, construction, material and application where verified product records are available." />
      <ProductGrid products={products} />
    </section>
  );
}
