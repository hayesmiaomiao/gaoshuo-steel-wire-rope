"use client";

import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/config/site";

const navItems = [
  ["Products", "/products"],
  ["Custom Assemblies", "/products/wire-rope-assemblies"],
  ["Applications", "/applications"],
  ["Services", "/services"],
  ["Resources", "/resources"],
  ["About", "/about"]
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[#D8D8D4] bg-white/95 backdrop-blur">
      <div className="container flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="leading-tight" aria-label="Gaoshuo Steel Wire Rope home">
          <span className="block text-xl font-black tracking-[0.08em] text-[#171717]">{siteConfig.shortName}</span>
          <span className="block text-xs font-bold tracking-[0.2em] text-[#555]">STEEL WIRE ROPE</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex" aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <Link key={href} className="hover:text-[#E8820C]" href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link className="border border-[#171717] px-4 py-3 text-sm font-bold hover:border-[#E8820C] hover:text-[#E8820C]" href="/request-a-quote">
            Request a Quote
          </Link>
        </div>
        <button
          type="button"
          className="border border-[#171717] px-4 py-2 font-bold lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
      </div>
      {open ? (
        <nav id="mobile-menu" className="border-t border-[#D8D8D4] bg-white lg:hidden" aria-label="Mobile navigation">
          <div className="container grid gap-1 py-4">
            {navItems.map(([label, href]) => (
              <Link key={href} className="px-2 py-3 font-semibold" href={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <Link className="mt-2 bg-[#E8820C] px-4 py-3 text-center font-bold text-[#171717]" href="/request-a-quote" onClick={() => setOpen(false)}>
              Request a Quote
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
