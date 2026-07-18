import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { LinkCard } from "@/components/ui/LinkCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServices } from "@/lib/data/services";
import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/schema";

const description = "Requirement-led services for custom wire rope assemblies, cutting, swaging, end fittings, coatings and drawing-based cable production.";

export const metadata = createMetadata({ title: "Cable Assembly Services", description, path: "/services" });

export default function ServicesPage() {
  const services = getServices();
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }];
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), collectionSchema("Cable Assembly Services", description, "/services")]} />
      <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} /></div>
      <PageHeader eyebrow="Services" title="Cable Assembly Services" description={description} />
      <section className="sectionAlt">
        <div className="container cardGrid">
          {services.map((service) => <LinkCard description={service.summary} href={`/services/${service.slug}`} key={service.slug} title={service.name} />)}
        </div>
      </section>
      <CTASection />
    </>
  );
}
