import type { MetadataRoute } from "next";
import { getSiteUrl, isStagingNoindex } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  if (isStagingNoindex()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", getSiteUrl()).toString()
  };
}
