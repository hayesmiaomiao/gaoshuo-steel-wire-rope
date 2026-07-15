import type { MetadataRoute } from "next";
import { applications, capabilities, constructions, productCategories } from "@/config/pages";
import { siteConfig } from "@/config/site";
import { getPublishedProducts } from "@/lib/products/data";
import { getPublishedResources } from "@/lib/content/resources";
import { getPublishedServices } from "@/lib/services/data";

function url(path: string): string {
  return new URL(path, siteConfig.domain).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/products",
    "/applications",
    "/capabilities",
    "/manufacturing",
    "/quality-control",
    "/about",
    "/resources",
    "/services",
    "/resources/guides",
    "/resources/comparisons",
    "/resources/technical",
    "/contact",
    "/request-a-quote",
    "/privacy-policy",
    ...productCategories.map((item) => `/products/${item.slug}`),
    ...applications.map((item) => `/applications/${item.slug}`),
    ...capabilities.map((item) => `/capabilities/${item.slug}`),
    ...constructions.map((item) => `/constructions/${item}`)
  ];

  const productPaths = getPublishedProducts().map((product) => `/products/${product.slug}`);
  const resourcePaths = getPublishedResources().map((resource) => `/resources/${resource.slug}`);
  const servicePaths = getPublishedServices().map((service) => `/services/${service.slug}`);

  return [...staticPaths, ...productPaths, ...servicePaths, ...resourcePaths].map((path) => ({
    url: url(path),
    lastModified: new Date()
  }));
}
