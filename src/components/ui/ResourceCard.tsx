import Link from "next/link";
import type { Resource } from "@/lib/content/resources";

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article className="border border-[#D8D8D4] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#E8820C]">{resource.category}</p>
      <h2 className="mt-2 text-xl font-bold text-[#171717]">
        <Link href={`/resources/${resource.slug}`}>{resource.title}</Link>
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#555]">{resource.description}</p>
    </article>
  );
}
