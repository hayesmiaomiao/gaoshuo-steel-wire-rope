import Link from "next/link";
import { MobileNavigation, type NavigationItem } from "./MobileNavigation";
import styles from "./Header.module.css";

const navigation: NavigationItem[] = [
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Applications", href: "/applications" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link aria-label="Gaoshuo Steel Wire Rope home" className={styles.brand} href="/">
          <strong>GAOSHUO</strong>
          <span>STEEL WIRE ROPE</span>
        </Link>
        <nav aria-label="Main navigation" className={styles.desktopNavigation}>
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className={styles.headerCta} href="/request-a-quote">
          Request a Quote
        </Link>
        <MobileNavigation items={navigation} />
      </div>
    </header>
  );
}
