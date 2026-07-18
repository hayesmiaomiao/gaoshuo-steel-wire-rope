import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCompany } from "@/lib/data/company";
import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, contactSchema } from "@/lib/seo/schema";

export const metadata = createMetadata({
  title: "Contact Gaoshuo Steel Wire Rope",
  description: "Contact information and inquiry route for Zhongshan Gaoshuo Technology Co., Ltd.",
  path: "/contact"
});

export default function ContactPage() {
  const company = getCompany();
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }];
  return (
    <>
      <JsonLd data={[breadcrumbSchema(breadcrumbs), contactSchema()]} />
      <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} /></div>
      <PageHeader eyebrow="Contact" title="Contact Gaoshuo Steel Wire Rope" description="Prepare your product type, application, dimensions, fittings and quantity before starting an inquiry." />
      <section className="section">
        <div className="container twoColumn">
          <article className="contentPanel"><h2>{company.companyName}</h2><p>{company.registeredAddress}</p></article>
          <article className="contentPanel"><h2>Online inquiry</h2><p>Official email, phone and WhatsApp details have not yet been published. Use the RFQ interface to prepare your requirement.</p><Link className="button buttonAccent" href="/request-a-quote">Open RFQ Form</Link></article>
        </div>
      </section>
    </>
  );
}
