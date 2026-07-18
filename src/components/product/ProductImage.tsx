"use client";

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

  return (
    <div className={`relative w-full overflow-hidden border border-[#D8D8D4] bg-[#F5F5F3] ${aspect === "square" ? "aspect-square" : "aspect-[4/3]"}`}>
      {/* Native rendering avoids image-optimizer failures on the production host. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        className="absolute inset-0 h-full w-full object-contain"
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        loading={priority ? "eager" : "lazy"}
        onError={(event) => {
          const image = event.currentTarget;
          if (image.dataset.fallbackApplied === "true") return;

          image.dataset.fallbackApplied = "true";
          image.src = fallbackImage;
        }}
        sizes={sizes}
        src={safeSource}
      />
    </div>
  );
}
