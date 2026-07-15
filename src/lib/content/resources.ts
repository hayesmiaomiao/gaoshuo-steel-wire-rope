import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { isValidSlug } from "@/lib/utils/slug";

export const resourceStatusSchema = z.enum(["idea", "researched", "draft", "reviewed", "published"]);

export const resourceFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string().refine(isValidSlug, "Invalid slug"),
  description: z.string(),
  category: z.string(),
  primaryKeyword: z.string(),
  relatedProducts: z.array(z.string()),
  relatedApplications: z.array(z.string()),
  author: z.string(),
  reviewedBy: z.string(),
  publishedAt: z.string(),
  updatedAt: z.string(),
  status: resourceStatusSchema,
  featuredImage: z.string(),
  noindex: z.boolean()
});

export type Resource = z.infer<typeof resourceFrontmatterSchema> & {
  body: string;
};

const resourceDir = path.join(process.cwd(), "content", "resources");

export function readResources(): { resources: Resource[]; errors: string[] } {
  const errors: string[] = [];
  const resources: Resource[] = [];
  const files = fs.existsSync(resourceDir) ? fs.readdirSync(resourceDir).filter((file) => file.endsWith(".md")) : [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(resourceDir, file), "utf8");
    const parsedMatter = matter(raw);
    const parsed = resourceFrontmatterSchema.safeParse(parsedMatter.data);
    if (!parsed.success) {
      errors.push(`${file}: ${parsed.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`).join("; ")}`);
      continue;
    }
    if (parsed.data.status !== "published" && parsed.data.noindex !== true) {
      errors.push(`${file}: non-published resources must be noindex`);
    }
    resources.push({ ...parsed.data, body: parsedMatter.content.trim() });
  }

  return { resources, errors };
}

export function getPublishedResources(): Resource[] {
  return readResources().resources.filter((resource) => resource.status === "published" && !resource.noindex);
}

export function getResourceBySlug(slug: string): Resource | undefined {
  return getPublishedResources().find((resource) => resource.slug === slug);
}
