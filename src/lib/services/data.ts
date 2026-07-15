import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { isValidSlug } from "@/lib/utils/slug";

export const serviceSchema = z.object({
  slug: z.string().refine(isValidSlug),
  service_name: z.string(),
  short_description: z.string(),
  problems_solved: z.array(z.string()),
  custom_options: z.array(z.string()),
  typical_applications: z.array(z.string()),
  buyer_required_information: z.array(z.string()),
  service_process: z.array(z.string()),
  related_products: z.array(z.string()),
  source_domains: z.array(z.string()),
  verification_status: z.enum(["unverified", "source-approved", "reviewed", "rejected"]),
  publishable: z.boolean(),
  status: z.enum(["draft", "reviewed", "published", "archived"]),
  notes: z.string()
});

export type Service = z.infer<typeof serviceSchema>;

const servicesPath = path.join(process.cwd(), "data", "services.json");

export function readServices(): { services: Service[]; errors: string[] } {
  const raw = fs.readFileSync(servicesPath, "utf8");
  const parsedJson = JSON.parse(raw) as unknown;
  const parsed = z.array(serviceSchema).safeParse(parsedJson);
  if (!parsed.success) {
    return { services: [], errors: parsed.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`) };
  }
  const errors: string[] = [];
  const slugs = new Set<string>();
  for (const service of parsed.data) {
    if (slugs.has(service.slug)) errors.push(`Duplicate service slug: ${service.slug}`);
    slugs.add(service.slug);
    if (service.status === "published") {
      if (!service.publishable) errors.push(`Published service must be publishable=true: ${service.slug}`);
      if (service.verification_status !== "source-approved" && service.verification_status !== "reviewed") {
        errors.push(`Published service must be source-approved or reviewed: ${service.slug}`);
      }
    }
  }
  return { services: parsed.data, errors };
}

export function getPublishedServices(): Service[] {
  return readServices().services.filter((service) => service.status === "published" && service.publishable);
}

export function getServiceBySlug(slug: string): Service | undefined {
  return getPublishedServices().find((service) => service.slug === slug);
}
