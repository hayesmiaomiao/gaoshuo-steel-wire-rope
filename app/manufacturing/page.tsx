import { TrustNotice } from "@/components/ui/TrustNotice";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Manufacturing Framework", description: "Manufacturing capability framework for Gaoshuo Steel Wire Rope with unverified claims intentionally excluded.", path: "/manufacturing" });

export default function ManufacturingPage() {
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">Manufacturing Framework</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">This page is prepared for verified manufacturing information such as process range, equipment and capacity.</p>
        <div className="mt-8"><TrustNotice /></div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {["Material and specification review", "Wire rope or assembly preparation", "Dimensional confirmation", "Packaging and shipment preparation"].map((item) => (
            <div className="border border-[#D8D8D4] p-5" key={item}>
              <h2 className="text-xl font-bold">{item}</h2>
              <p className="mt-2 text-sm text-[#555]">TODO: Add verified process details before publishing specific claims.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
