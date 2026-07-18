import Link from "next/link";
import styles from "./LinkCard.module.css";

export function LinkCard({ title, description, href, label = "Learn more" }: { title: string; description: string; href: string; label?: string }) {
  return (
    <article className={styles.card}>
      <h2>
        <Link href={href}>{title}</Link>
      </h2>
      <p>{description}</p>
      <Link className={styles.link} href={href}>
        {label} <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
