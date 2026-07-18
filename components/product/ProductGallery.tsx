"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./ProductGallery.module.css";

function galleryAlt(productName: string, source: string): string {
  const filename = source.split("/").at(-1) ?? "";
  if (filename.startsWith("terminal-")) return `Terminal detail on ${productName}`;
  if (filename.startsWith("construction-")) return `Cable construction detail of ${productName}`;
  if (filename.startsWith("application-")) return `${productName} application view`;
  return `Close-up view of ${productName}`;
}

export function ProductGallery({ productName, mainImage, gallery }: { productName: string; mainImage: string; gallery: string[] }) {
  const images = [mainImage, ...gallery.filter((image) => image !== mainImage)];
  const [selected, setSelected] = useState(mainImage);
  const selectedAlt = selected === mainImage ? productName : galleryAlt(productName, selected);

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <Image alt={selectedAlt} fill priority sizes="(max-width: 800px) 100vw, 50vw" src={selected} />
      </div>
      {images.length > 1 ? (
        <div aria-label={`${productName} gallery`} className={styles.thumbnails}>
          {images.map((image) => (
            <button
              aria-label={`Show ${image === mainImage ? productName : galleryAlt(productName, image)}`}
              aria-pressed={selected === image}
              className={selected === image ? styles.active : undefined}
              key={image}
              onClick={() => setSelected(image)}
              type="button"
            >
              <Image alt="" fill sizes="90px" src={image} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
