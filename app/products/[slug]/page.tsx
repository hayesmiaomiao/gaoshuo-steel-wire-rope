import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCategory } from "@/lib/data/categories";
import { getProduct, getProducts, getRelatedProducts } from "@/lib/data/products";
import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";
import { formatLabel } from "@/lib/utils/text";
import styles from "./ProductDetail.module.css";

type ProductPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProducts().map((product) => ({ slug: product.slug }));
}
export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return createMetadata({
    title: product.name,
    description: product.summary,
    path: `/products/${product.slug}`,
    image: product.image
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const category = getCategory(product.category);
  if (!category) notFound();
  const related = getRelatedProducts(product);
  const path = `/products/${product.slug}`;
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: category.name, path: `/products/category/${category.slug}` },
    { name: product.name, path }
  ];

  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), productSchema(product, category)]} />
      <div className="container">
        <Breadcrumbs items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: category.name, href: `/products/category/${category.slug}` },
          { label: product.name }
        ]} />
      </div>
      <section className={styles.productHero}>
        <div className={`container ${styles.heroGrid}`}>
          <ProductGallery gallery={product.gallery} mainImage={product.image} productName={product.name} />
          <div className={styles.summary}>
            <p className={styles.category}>{category.name}</p>
            <h1>{product.name}</h1>
            <p className={styles.sku}>SKU: {product.sku}</p>
            <p className={styles.lead}>{product.summary}</p>
            <ul className="tagList">
              {product.features.slice(0, 4).map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <Link className="button buttonAccent" href={`/request-a-quote?product=${encodeURIComponent(product.name)}`}>Request a Quote</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container twoColumn">
          <article className="contentPanel">
            <h2>Purchasing summary</h2>
            <p>{product.description}</p>
          </article>
          <article className="contentPanel">
            <h2>Specification confirmation</h2>
            <p>Detailed specifications are confirmed according to the selected materials, dimensions, fittings and application requirements.</p>
          </article>
        </div>
      </section>

      <section className="sectionAlt">
        <div className="container">
          <div className={styles.informationGrid}>
            <article><h2>Key Features</h2><ul className="bulletList">{product.features.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article><h2>Typical Applications</h2><ul className="bulletList">{product.applications.map((item) => <li key={item}>{formatLabel(item)}</li>)}</ul></article>
            <article><h2>Available Customization</h2><ul className="bulletList">{product.customization.map((item) => <li key={item}>{formatLabel(item)}</li>)}</ul></article>
            <article><h2>Information Required for Quotation</h2><ul className="bulletList"><li>Application and operating context</li><li>Required cable dimensions and overall length</li><li>Material, coating and end fitting details</li><li>Drawing or sample reference when available</li><li>Required quantity and packaging notes</li></ul></article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Related products" title="Continue your product review" />
          <ProductGrid products={related} />
        </div>
      </section>
      <CTASection title={`Discuss your ${product.name.toLowerCase()} requirement`} />
    </>
  );
}
