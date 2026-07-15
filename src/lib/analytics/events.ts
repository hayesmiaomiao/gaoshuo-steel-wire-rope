export type AnalyticsEvent =
  | "view_product"
  | "click_request_quote"
  | "start_rfq"
  | "submit_rfq"
  | "rfq_error"
  | "download_datasheet"
  | "click_email"
  | "click_phone"
  | "click_whatsapp"
  | "view_application"
  | "view_resource";

export function trackEvent(event: AnalyticsEvent, params: Record<string, string> = {}): void {
  if (typeof window === "undefined") return;
  const ga = (window as Window & { gtag?: (type: "event", event: string, params: Record<string, string>) => void }).gtag;
  if (!ga || !env.gaId) return;
  ga("event", event, params);
}
import { env } from "@/lib/env";
