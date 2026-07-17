import type { Product } from "@/lib/products/schema";
import { ProductImage } from "./ProductImage";

function galleryAlt(productName: string, source: string): string {
  const fileName = source.split("/").at(-1) ?? "";
  if (fileName.startsWith("detail-") || fileName.startsWith("main-alternative-")) return `Close-up of ${productName}`;
  if (fileName.startsWith("terminal-")) return `Terminal detail on ${productName}`;
  if (fileName.startsWith("construction-")) return `Construction detail of ${productName}`;
  if (fileName.startsWith("drawing-")) return `Technical drawing of ${productName}`;
  if (fileName.startsWith("application-")) return `${productName} application view`;
  if (fileName.startsWith("packaging-")) return `Packaging example for ${productName}`;
  return productName;
}

export function ProductGallery({ product }: { product: Product }) {
  const mainImage = product.image || "/images/placeholders/wire-rope-placeholder.svg";
  const gallery = [...new Set(product.galleryList.filter((source) => source && source !== mainImage))];

  return (
    <div className="grid gap-4">
      <ProductImage alt={product.product_name} priority src={mainImage} />
      {gallery.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {gallery.map((source) => (
            <ProductImage
              alt={galleryAlt(product.product_name, source)}
              aspect="landscape"
              key={source}
              sizes="(max-width: 768px) 50vw, 20vw"
              src={source}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

