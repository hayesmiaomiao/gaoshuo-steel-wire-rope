import "server-only";

import servicesJson from "@/data/services.json";
import { serviceSchema, type Service } from "@/lib/validation/schemas";

const services: Service[] = serviceSchema.array().parse(servicesJson);

export function getServices(): Service[] {
  return services;
}

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
