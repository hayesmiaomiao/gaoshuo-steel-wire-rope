import { EmptyState } from "@/components/ui/EmptyState";
import { ResourceCard } from "@/components/ui/ResourceCard";
import { getPublishedResources } from "@/lib/content/resources";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Steel Wire Rope Resources", description: "Technical guides, comparisons and resources for steel wire rope procurement.", path: "/resources" });

export default function ResourcesPage() {
  const resources = getPublishedResources();
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">Steel Wire Rope Resources</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">Published resources will appear here after technical review. Draft articles remain hidden and noindex.</p>
        <div className="mt-10">
          {resources.length ? <div className="grid gap-5 md:grid-cols-3">{resources.map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}</div> : <EmptyState title="No published resources yet" message="Three draft article structures are available in the content folder for future review." />}
        </div>
      </div>
    </section>
  );
}
