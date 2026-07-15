import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  if (env.stagingNoindex) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/"
        }
      ],
      sitemap: `${siteConfig.domain}/sitemap.xml`
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/thank-you"]
      }
    ],
    sitemap: `${siteConfig.domain}/sitemap.xml`
  };
}
