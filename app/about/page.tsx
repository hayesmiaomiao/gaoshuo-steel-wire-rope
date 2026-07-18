import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CTASection } from "@/components/ui/CTASection";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCompany } from "@/lib/data/company";
import { createMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata = createMetadata({
  title: "About Zhongshan Gaoshuo Technology",
  description: "Company information for Zhongshan Gaoshuo Technology Co., Ltd. and its custom wire rope and cable solution focus.",
  path: "/about"
});

export default function AboutPage() {
  const company = getCompany();
  const breadcrumbs = [{ name: "Home", path: "/" }, { name: "About", path: "/about" }];
  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} /></div>
      <PageHeader eyebrow="Company" title={company.companyName} description="Practical, reliable and application-oriented wire rope and cable solutions for international B2B customers." />
      <section className="section">
        <div className="container twoColumn">
          <article className="prose">
            <h2>Company profile</h2>
            <p>{company.description}</p>
          </article>
          <article className="contentPanel">
            <h2>Registered address</h2>
            <p>{company.registeredAddress}</p>
          </article>
        </div>
      </section>
      <section className="sectionAlt">
        <div className="container twoColumn">
          <article className="contentPanel"><h2>Product focus</h2><ul className="bulletList"><li>Custom wire rope assemblies</li><li>Mechanical control cables</li><li>Safety lanyards</li><li>Suspension cable systems</li><li>Fitness equipment cables</li><li>Related fittings</li></ul></article>
          <article className="contentPanel"><h2>Configuration inputs</h2><ul className="bulletList"><li>Wire rope material</li><li>Diameter and assembly length</li><li>Coating requirement</li><li>End fittings</li><li>Connection methods</li><li>Application context</li></ul></article>
        </div>
      </section>
      <CTASection />
    </>
  );
}
