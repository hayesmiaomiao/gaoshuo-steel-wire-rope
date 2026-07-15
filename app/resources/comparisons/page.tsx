import { ResourceCategoryPage } from "@/components/ui/ResourceCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Steel Wire Rope Comparisons", description: "Reviewed comparisons for steel wire rope sourcing decisions.", path: "/resources/comparisons" });

export default function Page() {
  return <ResourceCategoryPage category="comparisons" title="Steel Wire Rope Comparisons" description="Comparison articles are prepared as drafts until verified data is available." />;
}
