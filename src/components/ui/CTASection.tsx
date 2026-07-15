import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-[#171717] py-14 text-white">
      <div className="container grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-3xl font-bold">Need a verified steel wire rope specification?</h2>
          <p className="mt-3 max-w-2xl text-[#d8d8d4]">
            Share drawings, target application and procurement requirements. Our team can confirm available options before quotation.
          </p>
        </div>
        <Link className="inline-flex min-h-12 items-center justify-center border border-[#E8820C] bg-[#E8820C] px-6 font-bold text-[#171717]" href="/request-a-quote">
          Request a Quote
        </Link>
      </div>
    </section>
  );
}
