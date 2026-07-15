import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { RFQForm } from "@/components/rfq/RFQForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedServices, readServices } from "@/lib/services/data";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "Wire Rope Assembly Services",
  description: "Source-approved service migration framework for custom wire rope assemblies, cable cutting, swaging, terminal installation and packaging.",
  path: "/services"
});

export default function ServicesPage() {
  const publishedServices = getPublishedServices();
  const draftCount = readServices().services.filter((service) => service.status === "draft").length;

  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">Wire Rope Assembly Services</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">
          Service content from approved sources can be migrated here after brand cleanup, contact cleanup, deduplication and SEO rewriting.
        </p>
        <div className="mt-10">
          {publishedServices.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {publishedServices.map((service) => (
                <article key={service.slug} className="border border-[#D8D8D4] bg-white p-5">
                  <h2 className="text-xl font-bold text-[#171717]">{service.service_name}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#555]">{service.short_description}</p>
                  <Link className="mt-4 inline-flex font-bold underline decoration-[#E8820C] decoration-2 underline-offset-4" href={`/services/${service.slug}`}>
                    View service
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No published services yet" message={`${draftCount} draft service record is ready for source-approved migration review.`} />
          )}
        </div>
        <div className="mt-12">
          <SectionHeading title="Request Service Quote" description="Use Gaoshuo's own RFQ form for all service inquiries. Source website forms and contact details are not reused." />
          <RFQForm sourcePage="/services" />
        </div>
      </div>
    </section>
  );
}
