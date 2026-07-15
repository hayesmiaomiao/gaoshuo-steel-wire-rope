import { CategoryPage } from "@/components/product/CategoryPage";
import { productCategories } from "@/config/pages";
import { createMetadata } from "@/lib/seo/metadata";

const category = productCategories.find((item) => item.slug === "tool-safety-lanyards")!;

export const metadata = createMetadata({ title: category.title, description: category.description, path: `/products/${category.slug}` });

export default function Page() {
  return <CategoryPage title={category.title} description={category.description} slug={category.slug} />;
}
