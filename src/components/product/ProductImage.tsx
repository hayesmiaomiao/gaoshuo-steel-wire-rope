"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const fallbackImage = "/images/placeholders/wire-rope-placeholder.svg";

export function ProductImage({
  src,
  alt,
  priority = false,
  aspect = "square",
  sizes = "(max-width: 768px) 100vw, 50vw"
}: {
  src?: string;
  alt: string;
  priority?: boolean;
  aspect?: "square" | "landscape";
  sizes?: string;
}) {
  const safeSource = src?.startsWith("/") ? src : fallbackImage;
  const [currentSource, setCurrentSource] = useState(safeSource);

  useEffect(() => {
    setCurrentSource(safeSource);
  }, [safeSource]);

  return (
    <div className={`relative w-full overflow-hidden border border-[#D8D8D4] bg-[#F5F5F3] ${aspect === "square" ? "aspect-square" : "aspect-[4/3]"}`}>
      <Image
        alt={alt}
        className="object-contain"
        fill
        onError={() => {
          if (currentSource !== fallbackImage) setCurrentSource(fallbackImage);
        }}
        priority={priority}
        sizes={sizes}
        src={currentSource}
      />
    </div>
  );
}

