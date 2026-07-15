import { EmptyState } from "./EmptyState";
import { ResourceCard } from "./ResourceCard";
import { getPublishedResources } from "@/lib/content/resources";

export function ResourceCategoryPage({ category, title, description }: { category: string; title: string; description: string }) {
  const resources = getPublishedResources().filter((resource) => resource.category === category);
  return (
    <section className="py-12">
      <div className="container">
        <h1 className="text-4xl font-black text-[#171717]">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#555]">{description}</p>
        <div className="mt-10">
          {resources.length ? <div className="grid gap-5 md:grid-cols-3">{resources.map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}</div> : <EmptyState title="No published resources yet" message="Draft content exists but is hidden until reviewed and published." />}
        </div>
      </div>
    </section>
  );
}
