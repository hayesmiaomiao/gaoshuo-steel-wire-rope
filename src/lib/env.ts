const defaultUploadTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

function parseUploadSize(value: string | undefined): number {
  const parsed = Number(value || "5");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

function parseUploadTypes(value: string | undefined): string[] {
  if (!value) return defaultUploadTypes;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  leadProvider: process.env.LEAD_PROVIDER || (process.env.NODE_ENV === "production" ? "" : "development"),
  leadNotificationEmail: process.env.LEAD_NOTIFICATION_EMAIL || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  maxUploadSizeMb: parseUploadSize(process.env.MAX_UPLOAD_SIZE_MB),
  allowedUploadTypes: parseUploadTypes(process.env.ALLOWED_UPLOAD_TYPES),
  stagingNoindex: process.env.STAGING_NOINDEX === "true"
};

export function isLeadProviderConfigured(): boolean {
  if (env.leadProvider === "development") return process.env.NODE_ENV !== "production";
  if (env.leadProvider === "email") return Boolean(env.leadNotificationEmail && env.resendApiKey);
  return false;
}

export function getLeadConfigurationError(): string | null {
  if (isLeadProviderConfigured()) return null;
  if (process.env.NODE_ENV === "production") {
    return "Online inquiry is temporarily unavailable. The lead notification provider is not configured.";
  }
  return null;
}
