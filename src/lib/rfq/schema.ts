import { z } from "zod";
import { env } from "@/lib/env";

const allowedFileTypes = env.allowedUploadTypes;
const maxFileSize = env.maxUploadSizeMb * 1024 * 1024;
const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

export const rfqSchema = z.object({
  product: z.string().max(160).optional().default(""),
  productSku: z.string().max(80).optional().default(""),
  construction: z.string().max(120).optional().default(""),
  diameter: z.string().max(80).optional().default(""),
  material: z.string().max(120).optional().default(""),
  coating: z.string().max(120).optional().default(""),
  requiredLength: z.string().max(120).optional().default(""),
  quantity: z.string().max(120).optional().default(""),
  requiredBreakingLoad: z.string().max(160).optional().default(""),
  application: z.string().max(200).optional().default(""),
  fullName: z.string().min(2, "Please enter your full name").max(120),
  companyName: z.string().min(2, "Please enter your company name").max(160),
  businessEmail: z.string().email("Please enter a valid business email"),
  country: z.string().min(2, "Please enter your country").max(120),
  phoneOrWhatsapp: z.string().max(120).optional().default(""),
  message: z.string().min(10, "Please share your requirement").max(3000),
  privacyConsent: z.literal("on", {
    errorMap: () => ({ message: "Please confirm the privacy consent" })
  }),
  drawingNote: z.string().max(240).optional().default(""),
  sourcePage: z.string().max(240).optional().default(""),
  referrer: z.string().max(500).optional().default(""),
  landingPage: z.string().max(500).optional().default(""),
  utmSource: z.string().max(120).optional().default(""),
  utmMedium: z.string().max(120).optional().default(""),
  utmCampaign: z.string().max(160).optional().default(""),
  utmContent: z.string().max(160).optional().default(""),
  utmTerm: z.string().max(160).optional().default(""),
  website: z.string().max(0, "Spam detected").optional().default("")
});

export type RfqInput = z.infer<typeof rfqSchema>;

export function validateUpload(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (!allowedFileTypes.includes(file.type)) return "Only PDF, JPG, JPEG and PNG files are accepted.";
  if (!allowedExtensions.some((extension) => file.name.toLowerCase().endsWith(extension))) {
    return "Only PDF, JPG, JPEG and PNG files are accepted.";
  }
  if (file.size > maxFileSize) return "File size must be 5 MB or smaller.";
  return null;
}
