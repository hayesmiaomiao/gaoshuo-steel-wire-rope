import { notFound } from "next/navigation";
import { getPublishedResources, getResourceBySlug } from "@/lib/content/resources";
import { createMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return getPublishedResources().map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) return {};
  return createMetadata({ title: resource.title, description: resource.description, path: `/resources/${resource.slug}`, noindex: resource.noindex });
}

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) notFound();
  return (
    <section className="py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: resource.title,
          description: resource.description,
          author: { "@type": "Organization", name: resource.author }
        }}
      />
      <div className="container max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#E8820C]">{resource.category}</p>
        <h1 className="mt-3 text-4xl font-black text-[#171717]">{resource.title}</h1>
        <p className="mt-4 text-lg leading-8 text-[#555]">{resource.description}</p>
        <article className="prose mt-10 max-w-none whitespace-pre-line">{resource.body}</article>
      </div>
    </section>
  );
}
