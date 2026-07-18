import { siteConfig } from "@/config/site";
import { absoluteUrl } from "./metadata";
import type { Product } from "@/lib/products/schema";
import { isConfirmedSpecificationValue, type SpecificationRecord } from "@/lib/products/specification-model";

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

export function productSchema(product: Product, specification?: SpecificationRecord) {
  const images = [...new Set([product.image, ...product.galleryList].filter(Boolean))];
  const specificationIsReviewed = specification?.verification_status === "reviewed" || specification?.verification_status === "approved";
  const additionalProperty: { "@type": "PropertyValue"; name: string; value: string }[] = [];

  function addProperty(name: string, value: string | undefined): void {
    if (specificationIsReviewed && isConfirmedSpecificationValue(value)) additionalProperty.push({ "@type": "PropertyValue", name, value: value as string });
  }

  if (specification) {
    addProperty("Construction", specification.construction);
    addProperty("Material Grade", specification.material_grade);
    addProperty("Applicable Standard", specification.applicable_standard);
    if (isConfirmedSpecificationValue(specification.wire_rope_diameter_min_mm) && isConfirmedSpecificationValue(specification.wire_rope_diameter_max_mm)) {
      addProperty("Wire Rope Diameter", specification.wire_rope_diameter_min_mm === specification.wire_rope_diameter_max_mm ? `${specification.wire_rope_diameter_min_mm} mm` : `${specification.wire_rope_diameter_min_mm}–${specification.wire_rope_diameter_max_mm} mm`);
    }
    if (isConfirmedSpecificationValue(specification.breaking_load) && isConfirmedSpecificationValue(specification.load_unit)) addProperty("Minimum Breaking Load", `${specification.breaking_load} ${specification.load_unit}`);
    if (isConfirmedSpecificationValue(specification.working_load) && isConfirmedSpecificationValue(specification.load_unit)) addProperty("Working Load", `${specification.working_load} ${specification.load_unit}`);
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.product_name,
    sku: product.sku,
    description: product.short_description,
    image: images.length > 0 ? images.map((image) => absoluteUrl(image)) : undefined,
    material: specificationIsReviewed && isConfirmedSpecificationValue(specification?.material) ? specification?.material : undefined,
    category: product.category || undefined,
    additionalProperty: additionalProperty.length > 0 ? additionalProperty : undefined,
    brand: {
      "@type": "Brand",
      name: siteConfig.brandName
    }
  };
}
