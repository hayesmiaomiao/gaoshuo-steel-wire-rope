import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LinkCard } from "@/components/ui/LinkCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/schema";

const description = "Browse custom wire rope assemblies, safety lanyards, suspension kits, control cables, gym cables and wire rope fittings.";

export const metadata = createMetadata({ title: "Wire Rope and Cable Products", description, path: "/products" });

export default function ProductsPage() {
  const products = getProducts();
  const categories = getCategories();
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Products", path: "/products" }];

  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), collectionSchema("Wire Rope and Cable Products", description, "/products")]} />
      <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products" }]} /></div>
      <PageHeader eyebrow="Product center" title="Wire Rope and Cable Products" description={description} />
      <section className="section">
        <div className="container">
          <SectionHeading title="Shop by product category" description="Six product routes organize the 26 available product pages by typical sourcing need." />
          <div className="cardGrid">
            {categories.map((category) => (
              <LinkCard description={category.description} href={`/products/category/${category.slug}`} key={category.slug} label="View products" title={category.name} />
            ))}
          </div>
        </div>
      </section>
      <section className="sectionAlt">
        <div className="container">
          <SectionHeading title="All products" description={`${products.length} products available for requirement-based quotation.`} />
          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
