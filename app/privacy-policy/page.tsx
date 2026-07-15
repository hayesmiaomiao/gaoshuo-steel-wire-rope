import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Privacy Policy", description: "Privacy policy for Gaoshuo Steel Wire Rope inquiry website.", path: "/privacy-policy" });

export default function PrivacyPolicyPage() {
  return (
    <section className="py-12">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-black text-[#171717]">Privacy Policy</h1>
        <div className="mt-8 grid gap-6 leading-7 text-[#444]">
          <p>Gaoshuo Steel Wire Rope collects inquiry information only to respond to B2B requests, review product requirements and prepare quotations.</p>
          <p>Uploaded drawings or specifications should be shared only when you are authorized to provide them. Do not submit confidential information unless a separate agreement is in place.</p>
          <p>Analytics and marketing tools are optional and should be configured according to applicable consent and privacy requirements.</p>
        </div>
      </div>
    </section>
  );
}
