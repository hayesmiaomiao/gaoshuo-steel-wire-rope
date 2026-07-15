import { notFound } from "next/navigation";
import { RFQForm } from "@/components/rfq/RFQForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublishedServices, getServiceBySlug } from "@/lib/services/data";
import { getPublishedProducts } from "@/lib/products/data";
import { createMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return getPublishedServices().map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return createMetadata({
    title: `${service.service_name} Service`,
    description: service.short_description,
    path: `/services/${service.slug}`
  });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();
  const relatedProducts = getPublishedProducts().filter((product) => service.related_products.includes(product.slug)).slice(0, 4);

  return (
    <section className="py-12">
      <div className="container">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#E8820C]">Cable Assembly Service</p>
        <h1 className="mt-3 text-4xl font-black text-[#171717]">{service.service_name}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">{service.short_description}</p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div className="grid gap-10">
            <section>
              <SectionHeading title="What This Service Helps Solve" />
              <ul className="grid gap-3">
                {service.problems_solved.map((item) => <li className="border border-[#D8D8D4] p-4" key={item}>{item}</li>)}
              </ul>
            </section>
            <section>
              <SectionHeading title="Custom Options" />
              <div className="flex flex-wrap gap-3">
                {service.custom_options.map((item) => <span className="border border-[#D8D8D4] px-4 py-2" key={item}>{item}</span>)}
              </div>
            </section>
            <section>
              <SectionHeading title="Buyer Information Required" />
              <ul className="grid gap-3 md:grid-cols-2">
                {service.buyer_required_information.map((item) => <li className="bg-[#F5F5F3] p-4" key={item}>{item}</li>)}
              </ul>
            </section>
            <section>
              <SectionHeading title="Standard Workflow" />
              <ol className="grid gap-3">
                {service.service_process.map((item, index) => <li className="border-l-4 border-[#E8820C] bg-[#F5F5F3] p-4" key={item}><strong>Step {index + 1}:</strong> {item}</li>)}
              </ol>
            </section>
            <section>
              <SectionHeading title="Related Products" />
              {relatedProducts.length ? (
                <ul className="grid gap-3">
                  {relatedProducts.map((product) => <li className="border border-[#D8D8D4] p-4" key={product.sku}>{product.product_name}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-[#555]">Related products can be confirmed after the selected cable configuration is reviewed.</p>
              )}
            </section>
          </div>
          <aside>
            <SectionHeading title="Request Service Quote" />
            <RFQForm sourcePage={`/services/${service.slug}`} product={service.service_name} />
          </aside>
        </div>
      </div>
    </section>
  );
}
