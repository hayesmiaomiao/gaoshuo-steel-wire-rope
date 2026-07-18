import "server-only";

import applicationsJson from "@/data/applications.json";
import { applicationSchema, type Application } from "@/lib/validation/schemas";

const applications: Application[] = applicationSchema.array().parse(applicationsJson);

export function getApplications(): Application[] {
  return applications;
}

export function getApplication(slug: string): Application | undefined {
  return applications.find((application) => application.slug === slug);
}
