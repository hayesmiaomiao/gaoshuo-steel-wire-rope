import { applications } from "@/config/pages";
import { ApplicationCard } from "@/components/ui/ApplicationCard";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Steel Wire Rope Applications", description: "Application-based wire rope sourcing pages for industrial B2B procurement.", path: "/applications" });

export default function ApplicationsPage() {
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">Steel Wire Rope Applications</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">Application pages help buyers organize construction, material, coating and assembly requirements before quotation.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => <ApplicationCard key={application.slug} title={application.title} href={`/applications/${application.slug}`} description={application.description} />)}
        </div>
      </div>
    </section>
  );
}
