import { ResourceCategoryPage } from "@/components/ui/ResourceCategoryPage";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata = createMetadata({ title: "Steel Wire Rope Guides", description: "Reviewed steel wire rope selection guides for procurement teams.", path: "/resources/guides" });

export default function Page() {
  return <ResourceCategoryPage category="guides" title="Steel Wire Rope Guides" description="Selection guides will be published after verified technical review." />;
}
