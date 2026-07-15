import Link from "next/link";

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-[#555]">
      <ol className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            <Link className="underline-offset-4 hover:underline" href={item.href}>
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
