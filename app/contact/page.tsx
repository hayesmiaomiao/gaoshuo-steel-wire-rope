import { RFQForm } from "@/components/rfq/RFQForm";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Contact", description: "Contact Gaoshuo Steel Wire Rope for steel wire rope and assembly inquiries.", path: "/contact" });

export default function ContactPage() {
  return (
    <section className="py-12">
      <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h1 className="text-4xl font-black text-[#171717]">Contact</h1>
          <p className="mt-4 text-lg leading-8 text-[#555]">Send your wire rope requirement, drawing or procurement question.</p>
          <p className="mt-6 border-l-4 border-[#E8820C] bg-[#F5F5F3] p-4 text-sm leading-6 text-[#444]">
            Gaoshuo contact details will be displayed only after the official email, phone, WhatsApp and address are confirmed.
          </p>
        </div>
        <RFQForm sourcePage="/contact" />
      </div>
    </section>
  );
}
