import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RFQForm } from "@/components/rfq/RFQForm";
import { getProductsByCategory } from "@/lib/products/data";

const categoryDetails: Record<string, { products: string[]; materials: string[]; constructions: string[]; coatings: string[]; fittings: string[]; applications: string[]; faq: string[] }> = {
  "wire-rope-assemblies": {
    products: ["cut-to-length cable assemblies", "looped cable assemblies", "hook-end assemblies", "swaged terminal assemblies"],
    materials: ["stainless steel", "galvanized steel", "coated steel cable"],
    constructions: ["7x7", "7x19", "6x19", "configuration confirmed by drawing"],
    coatings: ["uncoated", "PVC coated", "galvanized finish"],
    fittings: ["eye loops", "carabiner hooks", "threaded terminals", "swage terminals"],
    applications: ["industrial assemblies", "control cables", "architectural hanging", "security retention"],
    faq: ["Can assemblies be made to drawing?", "Which end fittings can be reviewed?", "What information is required for quotation?"]
  },
  "tool-safety-lanyards": {
    products: ["coiled lanyards", "carabiner lanyards", "dual-hook lanyards", "equipment tethers"],
    materials: ["coated steel cable", "stainless steel cable", "spring coil cable"],
    constructions: ["coiled cable", "straight cable", "configuration confirmed by sample"],
    coatings: ["PVC", "PU", "color coating on request"],
    fittings: ["carabiners", "hooks", "rings", "loops"],
    applications: ["tool retention", "equipment tethering", "security cables"],
    faq: ["Can the coil length be customized?", "Can hooks be changed?", "Can packaging be supplied for distributors?"]
  },
  "suspension-hanging-kits": {
    products: ["lighting suspension kits", "panel hanging kits", "sign hanging kits", "cable gripper kits"],
    materials: ["stainless steel cable", "galvanized cable", "brass or metal grippers"],
    constructions: ["7x7", "7x19", "kit configuration confirmed by application"],
    coatings: ["uncoated", "clear or colored coating on request"],
    fittings: ["cable grippers", "ceiling fittings", "loops", "hooks"],
    applications: ["lighting", "LED panels", "signage", "architectural suspension"],
    faq: ["Can kit components be packed together?", "Can gripper threads be specified?", "Can cable length be adjusted?"]
  },
  "control-brake-cables": {
    products: ["Bowden cables", "push-pull cables", "brake cables", "throttle cables"],
    materials: ["steel inner cable", "stainless steel cable", "outer conduit options"],
    constructions: ["inner cable with housing", "push-pull cable configuration", "sample-based construction"],
    coatings: ["outer sheath options", "PVC covering", "application-specific covering"],
    fittings: ["barrel ends", "threaded terminals", "eye terminals", "custom ends"],
    applications: ["equipment control", "brake control", "throttle control", "mechanical movement"],
    faq: ["What travel length is required?", "Can a sample be matched?", "Which terminals should be specified?"]
  },
  "gym-fitness-cables": {
    products: ["gym equipment cables", "weight stack cables", "PVC coated gym cables", "ball-end fitness cables"],
    materials: ["coated steel cable", "stainless steel option", "PVC or nylon coating"],
    constructions: ["7x19 common flexible cable", "configuration confirmed by machine sample", "coated cable assembly"],
    coatings: ["PVC", "nylon", "color coating on request"],
    fittings: ["ball ends", "threaded terminals", "eye terminals", "custom machine fittings"],
    applications: ["weight stack machines", "training equipment", "replacement cable sourcing"],
    faq: ["Can machine samples be matched?", "Can coating color be specified?", "Can ball ends and threaded terminals be combined?"]
  },
  "wire-rope-fittings": {
    products: ["thimbles", "sleeves", "swage terminals", "cable grippers"],
    materials: ["stainless steel", "galvanized steel", "aluminum", "brass or zinc alloy options"],
    constructions: ["matched to selected wire rope diameter", "fitting geometry confirmed by drawing"],
    coatings: ["plain finish", "galvanized finish", "application-specific finish"],
    fittings: ["thimbles", "sleeves", "terminals", "hooks", "grippers"],
    applications: ["wire rope assemblies", "hanging kits", "fitness cables", "control cables"],
    faq: ["How should fitting size be confirmed?", "Can fittings be supplied with cable assemblies?", "Can drawing-based terminals be reviewed?"]
  }
};

export function CategoryPage({ title, description, slug }: { title: string; description: string; slug: string }) {
  const products = getProductsByCategory(slug);
  const details = categoryDetails[slug];
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">{description}</p>
        <div className="mt-10">
          {details ? (
            <div className="mb-12 grid gap-8">
              <section>
                <SectionHeading title="Typical Products" description="Common sourcing routes in this category. Final configuration should be confirmed by drawing, sample or application notes." />
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {details.products.map((item) => <div className="border border-[#D8D8D4] p-4 font-bold" key={item}>{item}</div>)}
                </div>
              </section>
              <section className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h2 className="text-2xl font-bold text-[#171717]">Common Materials and Constructions</h2>
                  <p className="mt-3 text-sm leading-6 text-[#555]">{[...details.materials, ...details.constructions].join(", ")}</p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#171717]">Coatings and End Fittings</h2>
                  <p className="mt-3 text-sm leading-6 text-[#555]">{[...details.coatings, ...details.fittings].join(", ")}</p>
                </div>
              </section>
              <section className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h2 className="text-2xl font-bold text-[#171717]">Typical Applications</h2>
                  <p className="mt-3 text-sm leading-6 text-[#555]">{details.applications.join(", ")}</p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#171717]">How to Submit an RFQ</h2>
                  <p className="mt-3 text-sm leading-6 text-[#555]">Share product type, cable diameter, length, material, coating, end fitting, quantity, application and any drawing or sample information.</p>
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-bold text-[#171717]">Category FAQ</h2>
                <div className="mt-4 grid gap-3">
                  {details.faq.map((item) => (
                    <details className="border border-[#D8D8D4] p-4" key={item}>
                      <summary className="cursor-pointer font-bold">{item}</summary>
                      <p className="mt-3 text-sm leading-6 text-[#555]">Please send the relevant drawing, sample or target specification so the team can confirm available options before quotation.</p>
                    </details>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
          <SectionHeading title="Published Products" description="Only reviewed and published product records appear in this category." />
          <ProductGrid products={products} />
        </div>
        <div className="mt-12">
          <SectionHeading title="Request Category Quote" description="Send drawings or target specifications. Unknown values can be confirmed before quotation." />
          <RFQForm sourcePage={`/products/${slug}`} product={title} />
        </div>
      </div>
    </section>
  );
}
