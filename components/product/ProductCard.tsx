import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/validation/schemas";
import { formatLabel } from "@/lib/utils/text";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className={styles.card}>
      <Link className={styles.imageLink} href={`/products/${product.slug}`} tabIndex={-1}>
        <Image
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
          src={product.image}
        />
      </Link>
      <div className={styles.content}>
        <p className={styles.category}>{formatLabel(product.category)}</p>
        <h2>
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h2>
        <p>{product.summary}</p>
        <Link className={styles.link} href={`/products/${product.slug}`}>
          View product details <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
