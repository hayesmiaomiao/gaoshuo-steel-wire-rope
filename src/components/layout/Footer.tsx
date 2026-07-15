import Link from "next/link";
import { copyrightText, siteConfig } from "@/config/site";

const footerGroups = [
  {
    title: "Products",
    links: [
      ["Wire Rope Assemblies", "/products/wire-rope-assemblies"],
      ["Tool & Safety Lanyards", "/products/tool-safety-lanyards"],
      ["Suspension & Hanging Kits", "/products/suspension-hanging-kits"],
      ["Control & Brake Cables", "/products/control-brake-cables"],
      ["Gym Fitness Cables", "/products/gym-fitness-cables"],
      ["Wire Rope Fittings", "/products/wire-rope-fittings"]
    ]
  },
  {
    title: "Applications",
    links: [
      ["Marine", "/applications/marine"],
      ["Crane and Lifting", "/applications/crane-and-lifting"],
      ["Architectural", "/applications/architectural"],
      ["Industrial Assemblies", "/applications/industrial-assemblies"]
    ]
  },
  {
    title: "Company",
    links: [
      ["Capabilities", "/capabilities"],
      ["Manufacturing", "/manufacturing"],
      ["Quality Control", "/quality-control"],
      ["About", "/about"]
    ]
  },
  {
    title: "Resources",
    links: [
      ["Guides", "/resources/guides"],
      ["Comparisons", "/resources/comparisons"],
      ["Technical", "/resources/technical"],
      ["Privacy Policy", "/privacy-policy"]
    ]
  }
];

export function Footer() {
  return (
    <footer className="border-t border-[#D8D8D4] bg-[#171717] text-white">
      <div className="container grid gap-10 py-12 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <p className="text-2xl font-black tracking-[0.08em]">GAOSHUO</p>
          <p className="text-sm font-bold tracking-[0.2em] text-[#D8D8D4]">STEEL WIRE ROPE</p>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#D8D8D4]">
            Steel wire rope and custom wire rope assembly website framework for international B2B inquiries.
          </p>
          {siteConfig.contactDetailsConfirmed && siteConfig.email ? <p className="mt-5 text-sm text-[#D8D8D4]">{siteConfig.email}</p> : null}
          <Link className="mt-6 inline-flex border border-[#E8820C] bg-[#E8820C] px-5 py-3 font-bold text-[#171717]" href="/request-a-quote">
            Request a Quote
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-base font-bold">{group.title}</h2>
              <ul className="mt-4 grid gap-3 text-sm text-[#D8D8D4]">
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link className="hover:text-[#E8820C]" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-[#333] py-5">
        <div className="container text-sm text-[#D8D8D4]">{copyrightText}</div>
      </div>
    </footer>
  );
}
