import type { LeadPayload, LeadProvider, LeadResult } from "../types";

export class DevelopmentLeadProvider implements LeadProvider {
  async submitLead(payload: LeadPayload): Promise<LeadResult> {
    console.info("Development RFQ submission", {
      submittedAt: payload.submittedAt,
      product: payload.fields.product,
      companyName: payload.fields.companyName,
      country: payload.fields.country,
      hasAttachment: Boolean(payload.attachment)
    });

    return {
      ok: true,
      message: "Development mode: your RFQ was validated and logged locally. No email was sent."
    };
  }
}
