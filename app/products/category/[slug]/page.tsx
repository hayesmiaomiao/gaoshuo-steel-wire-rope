import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCategories, getCategory } from "@/lib/data/categories";
import { getProductsByCategory } from "@/lib/data/products";
import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/schema";

type CategoryPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return createMetadata({
    title: category.name,
    description: category.description,
    path: `/products/category/${category.slug}`
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const products = getProductsByCategory(category.slug);
  const path = `/products/category/${category.slug}`;
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: category.name, path }
  ];

  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), collectionSchema(category.name, category.description, path)]} />
      <div className="container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: category.name }]} />
      </div>
      <PageHeader eyebrow="Product category" title={category.name} description={category.description} />
      <section className="sectionAlt">
        <div className="container">
          <ProductGrid products={products} />
        </div>
      </section>
      <CTASection title={`Request a quote for ${category.name.toLowerCase()}`} />
    </>
  );
}
