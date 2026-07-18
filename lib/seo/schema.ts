import type { Category, Company, Product } from "@/lib/validation/schemas";
import { getSiteUrl } from "./metadata";

type BreadcrumbItem = { name: string; path: string };

export function organizationSchema(company: Company) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.companyName,
    alternateName: company.brandName,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.registeredAddress,
      addressCountry: "CN"
    },
    description: company.description,
    url: getSiteUrl().toString()
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Gaoshuo Steel Wire Rope",
    url: getSiteUrl().toString()
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, getSiteUrl()).toString()
    }))
  };
}

export function productSchema(product: Product, category: Category) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: [product.image, ...product.gallery].map((image) => new URL(image, getSiteUrl()).toString()),
    description: product.description,
    brand: { "@type": "Brand", name: "Gaoshuo Steel Wire Rope" },
    category: category.name
  };
}

export function collectionSchema(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: new URL(path, getSiteUrl()).toString()
  };
}

export function contactSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Gaoshuo Steel Wire Rope",
    url: new URL("/contact", getSiteUrl()).toString()
  };
}
