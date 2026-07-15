import Link from "next/link";

export function Hero({ title, description }: { title: string; description: string }) {
  return (
    <section className="bg-[#171717] py-16 text-white">
      <div className="container">
        <h1 className="max-w-4xl text-4xl font-black md:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#D8D8D4]">{description}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link className="bg-[#E8820C] px-6 py-4 font-bold text-[#171717]" href="/request-a-quote">Request a Quote</Link>
          <Link className="border border-white px-6 py-4 font-bold" href="/products">Explore Products</Link>
        </div>
      </div>
    </section>
  );
}
