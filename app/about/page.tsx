import { TrustNotice } from "@/components/ui/TrustNotice";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "About Gaoshuo Steel Wire Rope", description: "About Gaoshuo Steel Wire Rope and the verified-information approach for B2B procurement.", path: "/about" });

export default function AboutPage() {
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">About Gaoshuo Steel Wire Rope</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">Gaoshuo Steel Wire Rope is presented as a professional B2B steel wire rope supplier website. Company facts will be expanded after verified information is added to the knowledge base.</p>
        <div className="mt-8"><TrustNotice /></div>
      </div>
    </section>
  );
}
