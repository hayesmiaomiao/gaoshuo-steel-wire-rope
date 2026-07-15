import type { LeadPayload, LeadProvider, LeadResult } from "../types";
import { env } from "@/lib/env";

export class EmailLeadProvider implements LeadProvider {
  async submitLead(payload: LeadPayload): Promise<LeadResult> {
    void payload;
    if (!env.resendApiKey || !env.leadNotificationEmail) {
      return {
        ok: false,
        message: "Email lead provider is not configured. Please set RESEND_API_KEY and LEAD_NOTIFICATION_EMAIL."
      };
    }

    return {
      ok: false,
      message: "Email provider adapter is prepared, but live email sending is intentionally not enabled in this scaffold."
    };
  }
}
