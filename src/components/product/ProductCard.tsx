import Link from "next/link";
import type { Product } from "@/lib/products/schema";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="grid border border-[#D8D8D4] bg-white">
      <ProductImage alt={product.product_name} aspect="landscape" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" src={product.image} />
      <div className="grid gap-3 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#E8820C]">{product.category}</p>
        <h2 className="text-xl font-bold text-[#171717]">
          <Link className="hover:text-[#E8820C]" href={`/products/${product.slug}`}>
            {product.product_name}
          </Link>
        </h2>
        <p className="text-sm leading-6 text-[#555]">{product.short_description}</p>
        <Link className="mt-2 inline-flex font-bold text-[#171717] underline decoration-[#E8820C] decoration-2 underline-offset-4" href={`/products/${product.slug}`}>
          View product
        </Link>
      </div>
    </article>
  );
}
