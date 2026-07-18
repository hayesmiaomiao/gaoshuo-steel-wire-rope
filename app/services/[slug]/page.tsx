import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getProduct } from "@/lib/data/products";
import { getService, getServices } from "@/lib/data/services";
import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { formatLabel } from "@/lib/utils/text";
import styles from "@/app/EntityPages.module.css";

type ServicePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getServices().map((service) => ({ slug: service.slug }));
}
export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return createMetadata({ title: service.name, description: service.summary, path: `/services/${service.slug}` });
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const relatedProducts = service.relatedProducts.map((productSlug) => getProduct(productSlug)).filter((product) => product !== undefined);
  const path = `/services/${service.slug}`;
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: service.name, path }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.name }]} /></div>
      <PageHeader eyebrow="Cable assembly service" title={service.name} description={service.summary} />
      <section className="section">
        <div className={`container ${styles.detailGrid}`}>
          <article><h2>Problems this service addresses</h2><ul className="bulletList">{service.problemsSolved.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><h2>Available configuration</h2><ul className="bulletList">{service.customization.map((item) => <li key={item}>{formatLabel(item)}</li>)}</ul></article>
          <article><h2>Information required for quotation</h2><ul className="bulletList">{service.quoteRequirements.map((item) => <li key={item}>{formatLabel(item)}</li>)}</ul></article>
          <article><h2>Typical applications</h2><ul className="bulletList">{service.applications.map((item) => <li key={item}>{formatLabel(item)}</li>)}</ul></article>
        </div>
      </section>
      <section className="sectionAlt">
        <div className="container">
          <SectionHeading eyebrow="Service process" title="From requirement review to inspection" />
          <ol className={styles.process}>{service.process.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol>
        </div>
      </section>
      {relatedProducts.length ? <section className="section"><div className="container"><SectionHeading title="Related products" /><ProductGrid products={relatedProducts} /></div></section> : null}
      <CTASection title={`Discuss your ${service.name.toLowerCase()} requirement`} />
    </>
  );
}
