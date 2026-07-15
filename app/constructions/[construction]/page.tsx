import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RFQForm } from "@/components/rfq/RFQForm";
import { constructions } from "@/config/pages";
import { getProductsByConstruction } from "@/lib/products/data";
import { createMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return constructions.map((construction) => ({ construction }));
}

export async function generateMetadata({ params }: { params: Promise<{ construction: string }> }) {
  const { construction } = await params;
  if (!constructions.includes(construction as (typeof constructions)[number])) return {};
  return createMetadata({
    title: `${construction} Wire Rope Construction`,
    description: `Published ${construction} wire rope products and procurement inquiry framework.`,
    path: `/constructions/${construction}`
  });
}

export default async function ConstructionPage({ params }: { params: Promise<{ construction: string }> }) {
  const { construction } = await params;
  if (!constructions.includes(construction as (typeof constructions)[number])) notFound();
  const products = getProductsByConstruction(construction);
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">{construction} Wire Rope Construction</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">This page only lists published products with this construction in the product database.</p>
        <div className="mt-10">
          <SectionHeading title="Published Products" />
          <ProductGrid products={products} />
        </div>
        <div className="mt-12">
          <SectionHeading title="Ask About This Construction" />
          <RFQForm sourcePage={`/constructions/${construction}`} product={`${construction} wire rope`} construction={construction} />
        </div>
      </div>
    </section>
  );
}
