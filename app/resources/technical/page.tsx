import { ResourceCategoryPage } from "@/components/ui/ResourceCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Steel Wire Rope Technical Resources", description: "Technical notes and documents for steel wire rope procurement.", path: "/resources/technical" });

export default function Page() {
  return <ResourceCategoryPage category="technical" title="Steel Wire Rope Technical Resources" description="Technical resources will be published after verified data is added." />;
}
