import Link from "next/link";

export function CapabilityCard({ title, href, description }: { title: string; href: string; description: string }) {
  return (
    <article className="border border-[#D8D8D4] bg-[#F5F5F3] p-5">
      <h2 className="text-xl font-bold text-[#171717]">
        <Link className="hover:text-[#E8820C]" href={href}>
          {title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-6 text-[#555]">{description}</p>
    </article>
  );
}
