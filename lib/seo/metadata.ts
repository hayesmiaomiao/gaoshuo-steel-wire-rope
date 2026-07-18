import type { Metadata } from "next";

export const siteName = "Gaoshuo Steel Wire Rope";
export const defaultDescription =
  "Custom wire rope assemblies, control cables, safety lanyards, suspension systems, fitness cables and related fittings for international B2B sourcing.";

export function isStagingNoindex(value = process.env.STAGING_NOINDEX): boolean {
  return value === "true";
}

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  try {
    return new URL(configured || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function createMetadata({ title, description, path, image }: MetadataInput): Metadata {
  const canonical = new URL(path, getSiteUrl()).toString();
  const images = image ? [new URL(image, getSiteUrl()).toString()] : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: isStagingNoindex() ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: canonical,
      images
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images
    }
  };
}
