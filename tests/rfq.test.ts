import { describe, expect, it } from "vitest";
import { rfqSchema } from "@/lib/rfq/schema";

const validRfq = {
  product: "7x7 Stainless Steel Wire Rope",
  productSku: "GS-DRAFT-7X7-SS",
  construction: "7x7",
  diameter: "2 mm",
  material: "stainless steel",
  coating: "",
  requiredLength: "100 m",
  quantity: "10 reels",
  requiredBreakingLoad: "",
  application: "marine",
  fullName: "Procurement Buyer",
  companyName: "Example Import Co",
  businessEmail: "buyer@example.com",
  country: "United States",
  phoneOrWhatsapp: "",
  message: "Please review this requirement and confirm available options.",
  privacyConsent: "on",
  drawingNote: "",
  sourcePage: "/request-a-quote",
  referrer: "",
  landingPage: "https://example.com/request-a-quote",
  utmSource: "google",
  utmMedium: "cpc",
  utmCampaign: "wire-rope",
  utmContent: "ad-a",
  utmTerm: "steel wire rope",
  website: ""
};

describe("RFQ validation", () => {
  it("accepts valid RFQ data", () => {
    expect(rfqSchema.safeParse(validRfq).success).toBe(true);
  });

  it("rejects missing consent", () => {
    expect(rfqSchema.safeParse({ ...validRfq, privacyConsent: "" }).success).toBe(false);
  });

  it("records UTM fields", () => {
    const parsed = rfqSchema.parse(validRfq);
    expect(parsed.utmSource).toBe("google");
    expect(parsed.utmCampaign).toBe("wire-rope");
  });
});
