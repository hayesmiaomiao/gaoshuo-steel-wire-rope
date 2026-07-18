"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";

export type NavigationItem = { label: string; href: string };

export function MobileNavigation({ items }: { items: NavigationItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.mobileNavigation}>
      <button
        aria-controls="mobile-menu"
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className={styles.menuButton}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>
      {open ? (
        <nav aria-label="Mobile navigation" className={styles.mobileMenu} id="mobile-menu">
          {items.map((item) => (
            <Link href={item.href} key={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link className={styles.mobileCta} href="/request-a-quote" onClick={() => setOpen(false)}>
            Request a Quote
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
