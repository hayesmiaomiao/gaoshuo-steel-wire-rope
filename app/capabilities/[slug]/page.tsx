import { notFound } from "next/navigation";
import { capabilities } from "@/config/pages";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RFQForm } from "@/components/rfq/RFQForm";
import { TrustNotice } from "@/components/ui/TrustNotice";
import { createMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return capabilities.map((capability) => ({ slug: capability.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const capability = capabilities.find((item) => item.slug === slug);
  if (!capability) return {};
  return createMetadata({ title: capability.title, description: capability.description, path: `/capabilities/${slug}` });
}

export default async function CapabilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const capability = capabilities.find((item) => item.slug === slug);
  if (!capability) notFound();
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">{capability.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">{capability.description}</p>
        <div className="mt-8"><TrustNotice /></div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <SectionHeading title="Capability Review Checklist" />
            <ul className="grid gap-3">
              {["Drawing or sample requirement", "Wire rope construction and diameter", "Terminal or fitting type", "Tolerance and packaging expectation", "Inspection or documentation requirement"].map((item) => (
                <li className="border border-[#D8D8D4] p-4" key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeading title="Request Capability Quote" />
            <RFQForm sourcePage={`/capabilities/${slug}`} />
          </div>
        </div>
      </div>
    </section>
  );
}
