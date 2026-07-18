import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getApplication, getApplications } from "@/lib/data/applications";
import { getProducts } from "@/lib/data/products";
import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/schema";

type ApplicationPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getApplications().map((application) => ({ slug: application.slug }));
}
export async function generateMetadata({ params }: ApplicationPageProps) {
  const { slug } = await params;
  const application = getApplication(slug);
  if (!application) return {};
  return createMetadata({ title: `${application.name} Cable Solutions`, description: application.description, path: `/applications/${application.slug}` });
}
export default async function ApplicationPage({ params }: ApplicationPageProps) {
  const { slug } = await params;
  const application = getApplication(slug);
  if (!application) notFound();
  const products = getProducts().filter((product) => product.applications.includes(application.slug));
  const path = `/applications/${application.slug}`;
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Applications", path: "/applications" }, { name: application.name, path }];

  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), collectionSchema(`${application.name} Cable Solutions`, application.description, path)]} />
      <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Applications", href: "/applications" }, { label: application.name }]} /></div>
      <PageHeader eyebrow="Application area" title={`${application.name} Cable Solutions`} description={application.description} />
      <section className="section">
        <div className="container twoColumn">
          <article className="contentPanel"><h2>Define the application</h2><p>Provide the operating context, cable path, connection points and relevant dimensional constraints before product selection.</p></article>
          <article className="contentPanel"><h2>Prepare the sourcing brief</h2><p>Include material, cable diameter, overall length, coating, end fittings, quantity and any drawing or sample reference.</p></article>
        </div>
      </section>
      <section className="sectionAlt"><div className="container"><SectionHeading title={`Products used in ${application.name.toLowerCase()} inquiries`} />{products.length ? <ProductGrid products={products} /> : <p>No specific product route is assigned. Please submit the application details for review.</p>}</div></section>
      <CTASection title={`Discuss your ${application.name.toLowerCase()} application`} />
    </>
  );
}
