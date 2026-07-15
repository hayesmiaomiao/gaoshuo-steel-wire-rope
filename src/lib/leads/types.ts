import type { RfqInput } from "@/lib/rfq/schema";

export type LeadAttachment = {
  fileName: string;
  contentType: string;
  size: number;
};

export type LeadPayload = {
  fields: RfqInput;
  attachment?: LeadAttachment;
  submittedAt: string;
};

export type LeadResult = {
  ok: boolean;
  message: string;
};

export interface LeadProvider {
  submitLead(payload: LeadPayload): Promise<LeadResult>;
}
