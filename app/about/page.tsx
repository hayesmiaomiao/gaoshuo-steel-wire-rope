import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({
  title: "About Zhongshan Gaoshuo",
  description: "Learn about Zhongshan Gaoshuo Technology Co., Ltd., its business scope and custom wire rope, control cable and cable assembly solutions.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <section className="py-12">
      <div className="container">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#E8820C]">Company Profile</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-[#171717] md:text-5xl">Zhongshan Gaoshuo Technology Co., Ltd.</h1>
        <p className="mt-6 max-w-4xl text-lg leading-8 text-[#555]">
          Zhongshan Gaoshuo Technology Co., Ltd. is located in Zhongshan, Guangdong, China. The company integrates technical development, product manufacturing, metal product processing, sales, and import and export operations.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="border border-[#D8D8D4] p-6 md:p-8">
            <h2 className="text-2xl font-black text-[#171717]">Business Scope</h2>
            <p className="mt-4 leading-7 text-[#555]">
              Our registered business scope covers the manufacturing of steel wire ropes and related products, hardware manufacturing and development, metal products, mechanical components, surface treatment, technical services, and international trade.
            </p>
          </article>

          <article className="border border-[#D8D8D4] p-6 md:p-8">
            <h2 className="text-2xl font-black text-[#171717]">Product Focus</h2>
            <p className="mt-4 leading-7 text-[#555]">
              Gaoshuo focuses on custom wire rope assemblies, mechanical control cables, safety lanyards, suspension cable systems, fitness equipment cables, and related fittings.
            </p>
          </article>
        </div>

        <div className="mt-6 bg-[#F5F5F3] p-6 md:p-8">
          <h2 className="text-2xl font-black text-[#171717]">Application-Oriented Cable Solutions</h2>
          <p className="mt-4 max-w-4xl leading-7 text-[#555]">
            Products can be developed around specific application requirements, including wire rope material, diameter, assembly length, coating, end fittings, and connection methods.
          </p>
          <p className="mt-4 max-w-4xl leading-7 text-[#555]">
            We serve customers across industrial equipment, lighting suspension, mechanical control, safety protection, fitness equipment, and other customized cable assembly applications. Our goal is to provide practical, reliable, and application-oriented wire rope and cable solutions for customers worldwide.
          </p>
        </div>
      </div>
    </section>
  );
}
