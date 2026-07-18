import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createCompletenessRows } from "@/lib/products/specification-completeness";
import { SPECIFICATION_STATUSES } from "@/lib/products/specification-model";
import { publicDocumentExists, readProductSpecifications } from "@/lib/products/specifications";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Internal Product Specification Status",
  robots: { index: false, follow: false }
};

function documentStatus(value: string): string {
  if (value === "TBD") return "Not provided";
  if (value === "N/A") return "Not applicable";
  return publicDocumentExists(value) ? "Available" : "Missing file";
}

export default async function SpecificationStatusPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; verification_status?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const filters = await searchParams;
  const { specifications, errors } = readProductSpecifications();
  const specificationsBySku = new Map(specifications.map((record) => [record.sku, record]));
  const allRows = createCompletenessRows(specifications);
  const categories = [...new Set(allRows.map((row) => row.category))].sort();
  const rows = allRows.filter((row) =>
    (!filters.category || row.category === filters.category)
    && (!filters.verification_status || row.verification_status === filters.verification_status)
  );
  const totalTbd = rows.reduce((sum, row) => sum + Number(row.tbd_fields), 0);
  const totalNotApplicable = rows.reduce((sum, row) => sum + Number(row.na_fields), 0);
  const averageCompletion = rows.length === 0 ? 0 : rows.reduce((sum, row) => sum + Number(row.completion_percentage), 0) / rows.length;

  return (
    <section className="py-10">
      <div className="container">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#E8820C]">Development Only</p>
        <h1 className="mt-3 text-4xl font-black text-[#171717]">Product Specification Status</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#555]">Read-only status view for maintaining the SKU specification master. This route returns 404 in production and is excluded from public navigation and the sitemap.</p>

        {errors.length > 0 ? <div className="mt-6 border border-red-700 p-4 text-sm text-red-700">{errors.join(" ")}</div> : null}

        <form className="mt-8 grid gap-4 border border-[#D8D8D4] bg-[#F5F5F3] p-5 md:grid-cols-[1fr_1fr_auto] md:items-end" method="get">
          <label className="text-sm font-bold">
            Category
            <select className="mt-2 min-h-12 w-full border border-[#D8D8D4] bg-white px-3 font-normal" defaultValue={filters.category ?? ""} name="category">
              <option value="">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">
            Verification Status
            <select className="mt-2 min-h-12 w-full border border-[#D8D8D4] bg-white px-3 font-normal" defaultValue={filters.verification_status ?? ""} name="verification_status">
              <option value="">All statuses</option>
              {SPECIFICATION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <button className="min-h-12 bg-[#171717] px-6 font-bold text-white" type="submit">Apply Filters</button>
        </form>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Products", String(rows.length)],
            ["Average Completion", `${averageCompletion.toFixed(1)}%`],
            ["TBD Fields", String(totalTbd)],
            ["N/A Fields", String(totalNotApplicable)]
          ].map(([label, value]) => (
            <div className="border border-[#D8D8D4] p-5" key={label}>
              <p className="text-sm text-[#555]">{label}</p>
              <p className="mt-2 text-3xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-x-auto border border-[#D8D8D4]">
          <table className="min-w-[1200px] w-full text-left text-sm">
            <thead className="bg-[#171717] text-white">
              <tr>
                {['SKU', 'Product', 'Category', 'Status', 'Completion', 'TBD', 'N/A', 'Missing Critical Fields', 'Drawing', 'Datasheet', 'Risk'].map((heading) => <th className="p-3" key={heading}>{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const specification = specificationsBySku.get(row.sku);
                return (
                  <tr className="border-t border-[#D8D8D4] align-top" key={row.sku}>
                    <td className="p-3 font-bold">{row.sku}</td>
                    <td className="p-3">{row.product_name}</td>
                    <td className="p-3">{row.category}</td>
                    <td className="p-3">{row.verification_status}</td>
                    <td className="p-3">{row.completion_percentage}%</td>
                    <td className="p-3">{row.tbd_fields}</td>
                    <td className="p-3">{row.na_fields}</td>
                    <td className="p-3">{row.missing_critical_fields || "None"}</td>
                    <td className="p-3">{specification ? documentStatus(specification.drawing_file) : "Missing row"}</td>
                    <td className="p-3">{specification ? documentStatus(specification.datasheet_file) : "Missing row"}</td>
                    <td className="p-3 font-bold">{row.publish_risk}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
