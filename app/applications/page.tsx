import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { LinkCard } from "@/components/ui/LinkCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getApplications } from "@/lib/data/applications";
import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo/schema";

const description = "Explore cable sourcing contexts across marine, lifting, architectural, security, control, fitness and industrial assembly applications.";

export const metadata = createMetadata({ title: "Wire Rope Application Areas", description, path: "/applications" });

export default function ApplicationsPage() {
  const applications = getApplications();
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Applications", path: "/applications" }];
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), collectionSchema("Wire Rope Application Areas", description, "/applications")]} />
      <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Applications" }]} /></div>
      <PageHeader eyebrow="Applications" title="Wire Rope Application Areas" description={description} />
      <section className="sectionAlt"><div className="container cardGrid">{applications.map((application) => <LinkCard description={application.description} href={`/applications/${application.slug}`} key={application.slug} title={application.name} />)}</div></section>
      <CTASection />
    </>
  );
}
