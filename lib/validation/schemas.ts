import { z } from "zod";

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const imagePathSchema = z.string().regex(/^\/images\/products\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/);

export const productSchema = z.object({
  sku: z.string().min(1),
  slug: slugSchema,
  name: z.string().min(1),
  category: slugSchema,
  summary: z.string().min(1),
  description: z.string().min(1),
  applications: z.array(slugSchema).min(1),
  customization: z.array(z.string().min(1)).min(1),
  features: z.array(z.string().min(1)).min(1),
  image: imagePathSchema,
  gallery: z.array(imagePathSchema),
  featured: z.boolean()
});

export const categorySchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  description: z.string().min(1)
});

export const serviceSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  summary: z.string().min(1),
  problemsSolved: z.array(z.string().min(1)).min(1),
  customization: z.array(z.string().min(1)).min(1),
  applications: z.array(slugSchema).min(1),
  quoteRequirements: z.array(z.string().min(1)).min(1),
  process: z.array(z.string().min(1)).min(1),
  relatedProducts: z.array(slugSchema)
});

export const applicationSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  description: z.string().min(1)
});

export const companySchema = z.object({
  brandName: z.string().min(1),
  companyName: z.string().min(1),
  registeredAddress: z.string().min(1),
  description: z.string().min(1),
  email: z.string(),
  phone: z.string(),
  whatsapp: z.string(),
  officialDomain: z.string(),
  certifications: z.array(z.string()),
  foundingYear: z.string(),
  factoryArea: z.string(),
  productionCapacity: z.string()
});

export type Product = z.infer<typeof productSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Application = z.infer<typeof applicationSchema>;
export type Company = z.infer<typeof companySchema>;
