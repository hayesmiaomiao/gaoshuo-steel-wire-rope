import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrustNotice } from "@/components/ui/TrustNotice";
import { ApplicationCard } from "@/components/ui/ApplicationCard";
import { getPublishedProducts } from "@/lib/products/data";
import { productCategories } from "@/config/pages";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Steel Wire Rope Products",
  description: "Browse published steel wire rope products and category frameworks for verified B2B procurement.",
  path: "/products"
});

export default function ProductsPage() {
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">Steel Wire Rope Products</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">Product pages are generated from structured data. Draft records stay hidden until verified and published.</p>
        <div className="mt-8"><TrustNotice /></div>
        <div className="mt-12">
          <SectionHeading title="Product Categories" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {productCategories.map((category) => (
              <ApplicationCard key={category.slug} title={category.title} href={`/products/${category.slug}`} description={category.description} />
            ))}
          </div>
        </div>
        <div className="mt-12">
          <SectionHeading title="Published Products" />
          <ProductGrid products={getPublishedProducts()} />
        </div>
      </div>
    </section>
  );
}
