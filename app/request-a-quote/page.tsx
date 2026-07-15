import { RFQForm } from "@/components/rfq/RFQForm";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Request a Quote", description: "Request a steel wire rope or custom wire rope assembly quotation.", path: "/request-a-quote" });

export default function RequestQuotePage() {
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">Request a Quote</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">Share product requirements, application, drawing and quantity. Unknown values can be confirmed during review.</p>
        <div className="mt-10">
          <RFQForm sourcePage="/request-a-quote" />
        </div>
      </div>
    </section>
  );
}
