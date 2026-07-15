import { env } from "@/lib/env";

export const siteConfig = {
  brandName: "Gaoshuo Steel Wire Rope",
  shortName: "GAOSHUO",
  domain: env.siteUrl,
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  social: {
    linkedin: "",
    youtube: "",
    facebook: ""
  },
  defaultTitle: "Gaoshuo Steel Wire Rope | Custom Wire Rope Assemblies and Cable Solutions",
  defaultDescription:
    "Custom cable assemblies, control cables, safety lanyards and suspension solutions developed around dimensions, fittings and application requirements.",
  contactDetailsConfirmed: false
} as const;

export const copyrightText = "© 2026 Gaoshuo Steel Wire Rope. All rights reserved.";
