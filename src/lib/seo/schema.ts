import { siteConfig } from "@/config/site";
import { absoluteUrl } from "./metadata";
import type { Product } from "@/lib/products/schema";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.brandName,
    url: absoluteUrl("/"),
    email: siteConfig.email || undefined,
    telephone: siteConfig.phone || undefined,
    address: siteConfig.address || undefined
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.brandName,
    url: absoluteUrl("/")
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

export function productSchema(product: Product) {
  const images = [...new Set([product.image, ...product.galleryList].filter(Boolean))];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.product_name,
    sku: product.sku,
    description: product.short_description,
    image: images.length > 0 ? images.map((image) => absoluteUrl(image)) : undefined,
    material: product.material || undefined,
    category: product.category || undefined,
    brand: {
      "@type": "Brand",
      name: siteConfig.brandName
    }
  };
}
