import Link from "next/link";
import { getCompany } from "@/lib/data/company";
import styles from "./Footer.module.css";

export function Footer() {
  const company = getCompany();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <p className={styles.brand}>Gaoshuo Steel Wire Rope</p>
          <p className={styles.company}>{company.companyName}</p>
          <p className={styles.address}>{company.registeredAddress}</p>
        </div>
        <div>
          <h2>Products</h2>
          <Link href="/products/category/wire-rope-assemblies">Wire Rope Assemblies</Link>
          <Link href="/products/category/control-brake-cables">Control & Brake Cables</Link>
          <Link href="/products/category/gym-fitness-cables">Gym Fitness Cables</Link>
        </div>
        <div>
          <h2>Company</h2>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/applications">Applications</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
        <div>
          <h2>Inquiry</h2>
          <p>Prepare your dimensions, fittings, application and quantity for review.</p>
          <Link className={styles.quoteLink} href="/request-a-quote">
            Request a Quote
          </Link>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} {company.companyName}</span>
      </div>
    </footer>
  );
}
