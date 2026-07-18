import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CTASection } from "@/components/ui/CTASection";
import { LinkCard } from "@/components/ui/LinkCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getApplications } from "@/lib/data/applications";
import { getCategories } from "@/lib/data/categories";
import { getCompany } from "@/lib/data/company";
import { getFeaturedProducts } from "@/lib/data/products";
import { getServices } from "@/lib/data/services";
import { createMetadata } from "@/lib/seo/metadata";
import styles from "./Home.module.css";

export const metadata = createMetadata({
  title: "Custom Wire Rope Assemblies and Cable Solutions",
  description:
    "Custom cable assemblies, control cables, safety lanyards and suspension solutions developed around your dimensions, fittings and application requirements.",
  path: "/",
  image: "/images/products/custom-wire-rope-cable-assembly/main.webp"
});

export default function HomePage() {
  const categories = getCategories();
  const featuredProducts = getFeaturedProducts();
  const services = getServices();
  const applications = getApplications();
  const company = getCompany();

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div>
            <p className={styles.eyebrow}>International B2B cable sourcing</p>
            <h1>Custom Wire Rope Assemblies and Cable Solutions</h1>
            <p className={styles.heroText}>
              Custom cable assemblies, control cables, safety lanyards and suspension solutions developed around your dimensions, fittings and application requirements.
            </p>
            <div className={styles.actions}>
              <Link className="button buttonAccent" href="/request-a-quote">Request a Quote</Link>
              <Link className="button buttonLight" href="/products">Explore Products</Link>
            </div>
          </div>
          <div aria-hidden="true" className={styles.cableGraphic}>
            <span />
            <span />
            <span />
            <b>APPLICATION-READY CABLE ASSEMBLIES</b>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Product routes" title="Six product categories" description="Start with the cable assembly or fitting family that best matches your sourcing requirement." />
          <div className="cardGrid">
            {categories.map((category) => (
              <LinkCard description={category.description} href={`/products/category/${category.slug}`} key={category.slug} label="View category" title={category.name} />
            ))}
          </div>
        </div>
      </section>

      <section className="sectionAlt">
        <div className="container">
          <SectionHeading eyebrow="Selected products" title="Featured Products" description="Representative products with configurable length, material, coating and end fitting options." />
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Custom capabilities" title="From requirement review to finished assembly" description="Services are organized around the information required to define a practical cable assembly." />
          <div className="cardGrid">
            {services.slice(0, 6).map((service) => (
              <LinkCard description={service.summary} href={`/services/${service.slug}`} key={service.slug} title={service.name} />
            ))}
          </div>
        </div>
      </section>

      <section className="sectionAlt">
        <div className="container">
          <SectionHeading eyebrow="Application areas" title="Cable solutions organized by use" description="Application context helps define materials, dimensions, coatings and connection methods for quotation." />
          <div className="cardGrid">
            {applications.map((application) => (
              <LinkCard description={application.description} href={`/applications/${application.slug}`} key={application.slug} title={application.name} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Why Gaoshuo" title="Practical, requirement-led cable sourcing" />
          <div className={styles.valueGrid}>
            <article><strong>01</strong><h2>Configuration-focused</h2><p>Products can be developed around material, diameter, length, coating, end fittings and connection methods.</p></article>
            <article><strong>02</strong><h2>Application-oriented</h2><p>Inquiry review begins with the intended application and the dimensions or drawings available from the buyer.</p></article>
            <article><strong>03</strong><h2>Clear quotation inputs</h2><p>Product and service pages state the information needed to prepare a more complete sourcing request.</p></article>
          </div>
        </div>
      </section>

      <section className="sectionAlt">
        <div className="container">
          <SectionHeading eyebrow="RFQ process" title="A straightforward inquiry workflow" />
          <ol className={styles.process}>
            <li><span>1</span><div><h2>Describe the application</h2><p>Share where the cable will be used and the movement, attachment or suspension requirement.</p></div></li>
            <li><span>2</span><div><h2>Provide dimensions and fittings</h2><p>Include diameter, overall length, material, coating, end fittings, drawings or a sample reference.</p></div></li>
            <li><span>3</span><div><h2>Confirm quantity</h2><p>Add the required quantity and any packaging or labeling information relevant to purchasing.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className={`container ${styles.companyIntro}`}>
          <div>
            <p className={styles.eyebrowDark}>Company introduction</p>
            <h2>{company.companyName}</h2>
          </div>
          <div>
            <p>{company.description}</p>
            <Link className={styles.textLink} href="/about">Read about the company <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
