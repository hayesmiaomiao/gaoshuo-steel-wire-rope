import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTASection } from "@/components/ui/CTASection";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { TrustNotice } from "@/components/ui/TrustNotice";
import { ApplicationCard } from "@/components/ui/ApplicationCard";
import { CapabilityCard } from "@/components/ui/CapabilityCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getPublishedProducts } from "@/lib/products/data";
import { applications, capabilities, constructions, productCategories } from "@/config/pages";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Custom Wire Rope Assemblies and Cable Solutions",
  description: "Custom cable assemblies, control cables, safety lanyards and suspension solutions developed around dimensions, fittings and application requirements.",
  path: "/"
});

export default function HomePage() {
  const featuredProducts = getPublishedProducts().filter((product) => product.featuredBoolean && product.publishableBoolean).slice(0, 8);
  return (
    <>
      <section className="bg-[#171717] py-16 text-white md:py-24">
        <div className="container grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#E8820C]">International B2B Cable Assembly Supply</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl">Custom Wire Rope Assemblies and Cable Solutions</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#D8D8D4]">
              Custom cable assemblies, control cables, safety lanyards and suspension solutions developed around your dimensions, fittings and application requirements.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link className="bg-[#E8820C] px-6 py-4 font-bold text-[#171717]" href="/request-a-quote">Request a Quote</Link>
              <Link className="border border-white px-6 py-4 font-bold" href="/products">Explore Products</Link>
              <Link className="border border-[#E8820C] px-6 py-4 font-bold text-[#E8820C]" href="/request-a-quote">Submit a Drawing</Link>
              <Link className="border border-[#D8D8D4] px-6 py-4 font-bold" href="/applications">Discuss Your Application</Link>
            </div>
          </div>
          <PlaceholderImage alt="Gaoshuo Steel Wire Rope placeholder product visual" priority />
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          <SectionHeading title="Product Solution Entrances" description="Six commercial product routes for custom cable assemblies, safety lanyards, suspension kits, control cables, gym cables and fittings." />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {productCategories.map((category) => (
              <ApplicationCard key={category.slug} title={category.title} href={`/products/${category.slug}`} description={category.description} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F3] py-14">
        <div className="container">
          <SectionHeading title="Select by Wire Rope Construction" description="Construction pages only show products that are published in the product database." />
          <div className="flex flex-wrap gap-3">
            {constructions.map((construction) => (
              <Link className="border border-[#D8D8D4] bg-white px-4 py-3 font-bold hover:border-[#E8820C]" key={construction} href={`/constructions/${construction}`}>
                {construction}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          <SectionHeading title="Wire Rope Customization Capability" description="A structured intake for drawings, cut lengths, terminals, swaging and packaging. Unconfirmed scope remains marked in knowledge files." />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.slice(0, 5).map((capability) => (
              <CapabilityCard key={capability.slug} title={capability.title} href={`/capabilities/${capability.slug}`} description={capability.description} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F3] py-14">
        <div className="container">
          <SectionHeading title="Typical Application Scenarios" description="Application pages are written around sourcing and selection, with no unverified safety-critical claims." />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <ApplicationCard key={application.slug} title={application.title} href={`/applications/${application.slug}`} description={application.description} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading title="Why Choose Gaoshuo" description="The first version focuses on transparent specification handling and inquiry readiness instead of unverified marketing claims." />
            <TrustNotice />
          </div>
          <div className="grid gap-4">
            {["Share requirement or drawing", "Confirm product scope and missing details", "Review quotation and packaging needs", "Prepare production and shipment documents after order confirmation"].map((step, index) => (
              <div className="border border-[#D8D8D4] p-4" key={step}>
                <span className="font-black text-[#E8820C]">0{index + 1}</span>
                <p className="mt-1 font-bold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5F5F3] py-14">
        <div className="container">
          <SectionHeading title="Quality Control Process" description="Initial quality page framework is ready. Verified inspection data should be added before making specific claims." />
          <div className="grid gap-4 md:grid-cols-4">
            {["Requirement review", "Material and specification confirmation", "Dimensional and visual checks", "Documentation confirmation"].map((item) => (
              <div className="border border-[#D8D8D4] bg-white p-4 font-bold" key={item}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container">
          <SectionHeading title="Featured Products" description="Only source-approved, publishable products appear here. Draft records are intentionally hidden." />
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      <section className="bg-[#F5F5F3] py-14">
        <div className="container">
          <SectionHeading title="Technical Resources" description="Guides and comparisons are prepared as drafts and will appear after technical review." />
          <div className="grid gap-5 md:grid-cols-3">
            <ApplicationCard title="Guides" href="/resources/guides" description="Selection guides for future reviewed technical content." />
            <ApplicationCard title="Comparisons" href="/resources/comparisons" description="Comparison articles for procurement decisions after review." />
            <ApplicationCard title="Technical" href="/resources/technical" description="Technical notes and documents when verified data is available." />
          </div>
        </div>
      </section>
      <CTASection />
    </>
  );
}
