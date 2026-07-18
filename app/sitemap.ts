import type { MetadataRoute } from "next";
import { getApplications } from "@/lib/data/applications";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { getServices } from "@/lib/data/services";
import { getSiteUrl } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["/", "/products", "/services", "/applications", "/about", "/contact", "/request-a-quote", "/privacy-policy"];
  const paths = [
    ...staticPaths,
    ...getCategories().map((category) => `/products/category/${category.slug}`),
    ...getProducts().map((product) => `/products/${product.slug}`),
    ...getServices().map((service) => `/services/${service.slug}`),
    ...getApplications().map((application) => `/applications/${application.slug}`)
  ];
  return paths.map((path) => ({ url: new URL(path, getSiteUrl()).toString() }));
}
