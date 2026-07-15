import { DevelopmentLeadProvider } from "./providers/development";
import { EmailLeadProvider } from "./providers/email";
import type { LeadProvider } from "./types";
import { env } from "@/lib/env";

export function getLeadProvider(): LeadProvider {
  if (env.leadProvider === "email") return new EmailLeadProvider();
  return new DevelopmentLeadProvider();
}
