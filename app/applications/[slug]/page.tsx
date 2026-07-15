import { notFound } from "next/navigation";
import { applications } from "@/config/pages";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RFQForm } from "@/components/rfq/RFQForm";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getPublishedProducts } from "@/lib/products/data";
import { getPublishedServices } from "@/lib/services/data";
import { createMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return applications.map((application) => ({ slug: application.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const application = applications.find((item) => item.slug === slug);
  if (!application) return {};
  return createMetadata({ title: `${application.title} Wire Rope Applications`, description: application.description, path: `/applications/${slug}` });
}

export default async function ApplicationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const application = applications.find((item) => item.slug === slug);
  if (!application) notFound();
  const products = getPublishedProducts().filter((product) => product.applicationsList.includes(slug));
  const services = getPublishedServices().filter((service) => service.typical_applications.includes(slug)).slice(0, 4);
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">{application.title} Wire Rope Sourcing</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">{application.description}</p>
        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {["Confirm application context", "Define construction and material", "Share drawings or required length", "Review packaging and documentation"].map((item) => (
            <div className="border border-[#D8D8D4] p-5 font-bold" key={item}>{item}</div>
          ))}
        </div>
        <div className="mt-12">
          <SectionHeading title="Published Matching Products" />
          <ProductGrid products={products} />
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section>
            <SectionHeading title="Related Services" />
            {services.length ? (
              <ul className="grid gap-3">
                {services.map((service) => <li className="border border-[#D8D8D4] p-4" key={service.slug}>{service.service_name}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-[#555]">Service route can be confirmed after the application and drawing are reviewed.</p>
            )}
          </section>
          <section>
            <SectionHeading title="Procurement Parameters to Confirm" />
            <ul className="grid gap-3">
              {["cable construction", "diameter or finished cable size", "material and coating", "end fitting type", "length and quantity", "drawing or sample availability"].map((item) => (
                <li className="bg-[#F5F5F3] p-4" key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
        <div className="mt-12">
          <SectionHeading title="Request Application Quote" />
          <RFQForm sourcePage={`/applications/${slug}`} application={application.title} />
        </div>
      </div>
    </section>
  );
}
