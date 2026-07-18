import Link from "next/link";
import styles from "./PageElements.module.css";

export function CTASection({
  title = "Discuss your cable assembly requirement",
  description = "Send the application, dimensions, material, fittings and quantity required for quotation review."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className={styles.ctaSection}>
      <div className={`container ${styles.ctaInner}`}>
        <div>
          <p className={styles.eyebrowLight}>Project inquiry</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <Link className="button buttonAccent" href="/request-a-quote">
          Request a Quote
        </Link>
      </div>
    </section>
  );
}
