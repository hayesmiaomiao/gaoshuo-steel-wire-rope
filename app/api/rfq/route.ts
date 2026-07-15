import { NextResponse } from "next/server";
import { getLeadProvider } from "@/lib/leads/provider";
import { rfqSchema, validateUpload } from "@/lib/rfq/schema";
import { env, getLeadConfigurationError } from "@/lib/env";

export const runtime = "nodejs";

const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count += 1;
  return true;
}

export async function POST(request: Request) {
  const configurationError = getLeadConfigurationError();
  if (configurationError) {
    return NextResponse.json({ ok: false, message: configurationError }, { status: 503 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false, message: "Too many requests. Please try again later." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("drawing");
  const uploadError = validateUpload(file instanceof File ? file : null);
  if (uploadError) {
    return NextResponse.json({ ok: false, message: uploadError }, { status: 400 });
  }

  const parsed = rfqSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: parsed.error.issues[0]?.message || "Invalid RFQ data." }, { status: 400 });
  }

  const provider = getLeadProvider();
  const result = await provider.submitLead({
    fields: parsed.data,
    attachment:
      file instanceof File && file.size > 0
        ? {
            fileName: file.name,
            contentType: file.type,
            size: file.size
          }
        : undefined,
    submittedAt: new Date().toISOString()
  });

  return NextResponse.json({ ...result, development: env.leadProvider === "development" }, { status: result.ok ? 200 : 500 });
}
