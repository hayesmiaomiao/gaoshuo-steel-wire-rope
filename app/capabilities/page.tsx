import { capabilities } from "@/config/pages";
import { CapabilityCard } from "@/components/ui/CapabilityCard";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Wire Rope Custom Capabilities", description: "Custom wire rope assembly, cutting, swaging, terminal installation and packaging capability framework.", path: "/capabilities" });

export default function CapabilitiesPage() {
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">Wire Rope Custom Capabilities</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">Capability pages are structured for verified process ranges and drawing-based RFQ workflows.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => <CapabilityCard key={capability.slug} title={capability.title} href={`/capabilities/${capability.slug}`} description={capability.description} />)}
        </div>
      </div>
    </section>
  );
}
