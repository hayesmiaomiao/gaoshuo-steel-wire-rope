import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductGallery } from "@/components/product/ProductGallery";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpecificationTable } from "@/components/product/SpecificationTable";
import { TechnicalSpecificationTable } from "@/components/product/TechnicalSpecificationTable";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { RFQForm } from "@/components/rfq/RFQForm";
import { CTASection } from "@/components/ui/CTASection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";
import { createMetadata } from "@/lib/seo/metadata";
import { getProductBySlug, getPublishedProducts, getRelatedProducts } from "@/lib/products/data";
import { getProductSpecificationBySku } from "@/lib/products/specifications";
import { getSpecificationSourcePresentation } from "@/lib/products/specification-sources";
import { isConfirmedSpecificationValue } from "@/lib/products/specification-model";

export function generateStaticParams() {
  return getPublishedProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return createMetadata({
    title: product.seo_title || product.product_name,
    description: product.seo_description || product.short_description,
    path: `/products/${product.slug}`,
    image: product.image
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  const related = getRelatedProducts(product);
  const specification = getProductSpecificationBySku(product.sku);
  const sourcePresentation = getSpecificationSourcePresentation(product.sku);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.product_name, path: `/products/${product.slug}` }
          ]),
          productSchema(product, specification)
        ]}
      />
      <section className="py-12">
        <div className="container">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Products", href: "/products" }, { name: product.product_name, href: `/products/${product.slug}` }]} />
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <ProductGallery product={product} />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#E8820C]">{product.category}</p>
              <h1 className="mt-3 text-4xl font-black text-[#171717]">{product.product_name}</h1>
              <p className="mt-4 text-lg leading-8 text-[#555]">{product.short_description}</p>
              <div className="mt-8">
                <SpecificationTable
                  caption="Quick Specification"
                  rows={[
                    { label: "SKU", value: product.sku },
                    { label: "Product Type", value: product.product_type },
                    { label: "Applications", value: product.applicationsList }
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_0.7fr]">
            <div className="grid gap-10">
              <section>
                <SectionHeading title="Product Features" description="Key sourcing features are based on reviewed product and service content. Numeric performance values are confirmed case by case." />
                <SpecificationTable caption="Feature summary" rows={[{ label: "Features", value: product.featuresList }, { label: "Customization", value: product.customizationList }]} />
              </section>
              <section>
                <SectionHeading title="Technical Specification" />
                <TechnicalSpecificationTable category={product.category} specification={specification} approximateFields={sourcePresentation.approximateFields} />
              </section>
              <section>
                <SectionHeading title="Typical Applications" />
                <SpecificationTable caption="Application notes" rows={[{ label: "Applications", value: product.applicationsList }]} />
              </section>
              <section>
                <SectionHeading title="Information Required for Quotation" />
                <ul className="grid gap-3 md:grid-cols-2">
                  {["product type or drawing", "wire rope construction", "diameter or finished cable size", "overall length", "material and coating", "end fitting type", "quantity", "application notes"].map((item) => (
                    <li className="bg-[#F5F5F3] p-4" key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <SectionHeading title="Quality and Inspection" description="Quality requirements should be confirmed by drawing, specification or purchase order. Verified testing claims are not added until documentation is available." />
              </section>
              <section>
                <SectionHeading title="Product FAQ" />
                <div className="grid gap-4">
                  <details className="border border-[#D8D8D4] p-4">
                    <summary className="cursor-pointer font-bold">Can you confirm the final specification before quotation?</summary>
                    <p className="mt-3 text-sm leading-6 text-[#555]">Yes. Please share drawing, application, diameter, construction, material and target quantity so the team can confirm available options.</p>
                  </details>
                  <details className="border border-[#D8D8D4] p-4">
                    <summary className="cursor-pointer font-bold">Why are some values not listed?</summary>
                    <p className="mt-3 text-sm leading-6 text-[#555]">Unverified values are intentionally omitted to avoid inaccurate procurement information.</p>
                  </details>
                </div>
              </section>
              <section>
                <SectionHeading title="Related Applications" />
                <p className="text-sm leading-6 text-[#555]">{product.applicationsList.length ? product.applicationsList.join(", ") : "Please confirm the application with our team."}</p>
              </section>
            </div>
            <aside>
              <SectionHeading title="Request Product Quote" />
              <RFQForm sourcePage={`/products/${product.slug}`} product={product.product_name} productSku={product.sku} construction={isConfirmedSpecificationValue(specification?.construction) ? specification?.construction : ""} />
            </aside>
          </div>
          <RelatedProducts products={related} />
        </div>
      </section>
      <CTASection />
    </>
  );
}
