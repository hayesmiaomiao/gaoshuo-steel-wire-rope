import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Thank You", description: "Thank you for contacting Gaoshuo Steel Wire Rope.", path: "/thank-you", noindex: true });

export default function ThankYouPage() {
  return (
    <section className="py-20">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-black text-[#171717]">Thank You</h1>
        <p className="mt-4 text-lg leading-8 text-[#555]">Your inquiry has been submitted. In development mode, the submission is validated and logged locally instead of being sent by email.</p>
      </div>
    </section>
  );
}
