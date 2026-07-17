import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.domain).toString();
}

export function createMetadata({
  title,
  description,
  path,
  image,
  noindex = false
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const shouldNoindex = noindex || env.stagingNoindex;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: shouldNoindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.brandName,
      type: "website",
      images: image ? [{ url: absoluteUrl(image), alt: title }] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [absoluteUrl(image)] : undefined
    }
  };
}
