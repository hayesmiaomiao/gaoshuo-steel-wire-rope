import { RFQForm } from "@/components/forms/RFQForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, contactSchema } from "@/lib/seo/schema";

export const metadata = createMetadata({
  title: "Request a Wire Rope Assembly Quote",
  description: "Prepare a custom wire rope or cable assembly inquiry with application, dimensions, materials, fittings and quantity.",
  path: "/request-a-quote"
});

type QuotePageProps = { searchParams: Promise<{ product?: string }> };

export default async function QuotePage({ searchParams }: QuotePageProps) {
  const { product = "" } = await searchParams;
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Request a Quote", path: "/request-a-quote" }];
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), contactSchema()]} />
      <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Request a Quote" }]} /></div>
      <PageHeader eyebrow="RFQ" title="Request a Wire Rope Assembly Quote" description="Share the available product, application and dimensional information. No inquiry will be transmitted until an official delivery channel is configured." />
      <section className="sectionAlt"><div className="container"><RFQForm defaultProduct={product} /></div></section>
    </>
  );
}
