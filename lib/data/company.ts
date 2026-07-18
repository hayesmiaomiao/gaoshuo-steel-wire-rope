import "server-only";

import companyJson from "@/data/company.json";
import { companySchema, type Company } from "@/lib/validation/schemas";

const company: Company = companySchema.parse(companyJson);

export function getCompany(): Company {
  return company;
}
