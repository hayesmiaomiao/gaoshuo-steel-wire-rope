import { TrustNotice } from "@/components/ui/TrustNotice";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Quality Control", description: "Quality control workflow framework for steel wire rope procurement and verified inspection documentation.", path: "/quality-control" });

export default function QualityControlPage() {
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">Quality Control</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">Quality requirements should be confirmed against product data, drawings, standards and purchase order documents.</p>
        <div className="mt-8"><TrustNotice /></div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {["Specification review", "Incoming material check", "Dimensional and visual inspection", "Documentation confirmation"].map((item) => (
            <div className="border border-[#D8D8D4] p-5 font-bold" key={item}>{item}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
