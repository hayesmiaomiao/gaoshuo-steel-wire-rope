"use client";

export function ProductFilter({ label = "Filter products" }: { label?: string }) {
  return (
    <div className="border border-[#D8D8D4] bg-[#F5F5F3] p-4">
      <label className="block text-sm font-bold" htmlFor="product-filter">
        {label}
      </label>
      <input id="product-filter" className="mt-2 min-h-12 w-full border border-[#D8D8D4] px-3" placeholder="Search published products" disabled />
      <p className="mt-2 text-sm text-[#555]">Filtering UI placeholder for future published product volume.</p>
    </div>
  );
}
