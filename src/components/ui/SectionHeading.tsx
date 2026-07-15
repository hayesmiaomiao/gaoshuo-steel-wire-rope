type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow ? <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-[#E8820C]">{eyebrow}</p> : null}
      <h2 className="text-3xl font-bold text-[#171717] md:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-base leading-7 text-[#4a4a46]">{description}</p> : null}
    </div>
  );
}
