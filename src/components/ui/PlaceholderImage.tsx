import Image from "next/image";

export function PlaceholderImage({ alt, priority = false }: { alt: string; priority?: boolean }) {
  return (
    <Image
      src="/images/placeholders/wire-rope-placeholder.svg"
      alt={alt}
      width={1200}
      height={900}
      priority={priority}
      className="h-auto w-full border border-[#D8D8D4] bg-[#171717]"
    />
  );
}
