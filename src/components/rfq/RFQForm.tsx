"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { rfqSchema, type RfqInput } from "@/lib/rfq/schema";
import { FormField } from "./FormField";
import { FileUpload } from "./FileUpload";

type RFQFormProps = {
  sourcePage: string;
  product?: string;
  productSku?: string;
  construction?: string;
  application?: string;
};

export function RFQForm({ sourcePage, product = "", productSku = "", construction = "", application = "" }: RFQFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<RfqInput>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      product,
      productSku,
      construction,
      application,
      sourcePage,
      landingPage: typeof window !== "undefined" ? window.location.href : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      utmTerm: "",
      website: ""
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setValue("landingPage", window.location.href);
    setValue("referrer", document.referrer);
    setValue("utmSource", params.get("utm_source") ?? "");
    setValue("utmMedium", params.get("utm_medium") ?? "");
    setValue("utmCampaign", params.get("utm_campaign") ?? "");
    setValue("utmContent", params.get("utm_content") ?? "");
    setValue("utmTerm", params.get("utm_term") ?? "");
  }, [setValue]);

  async function onSubmit(values: RfqInput) {
    setServerError("");
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value));
    const fileInput = document.getElementById("drawing") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (file) formData.append("drawing", file);

    const response = await fetch("/api/rfq", { method: "POST", body: formData });
    const result = (await response.json()) as { ok: boolean; message: string; development?: boolean };
    setIsDevelopmentMode(Boolean(result.development));
    if (!response.ok || !result.ok) {
      setServerError(result.message || "The RFQ could not be submitted.");
      return;
    }
    router.push("/thank-you");
  }

  return (
    <form className="grid gap-5 border border-[#D8D8D4] bg-white p-5" onSubmit={handleSubmit(onSubmit)}>
      {isDevelopmentMode ? <p className="border border-[#E8820C] bg-[#F5F5F3] p-3 text-sm">Development mode: submissions are validated and logged locally. No email is sent.</p> : null}
      <div className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Product" name="product" register={register("product")} error={errors.product} />
        <FormField label="Wire Rope Construction" name="construction" register={register("construction")} error={errors.construction} />
        <FormField label="Diameter" name="diameter" register={register("diameter")} error={errors.diameter} />
        <FormField label="Material" name="material" register={register("material")} error={errors.material} />
        <FormField label="Coating" name="coating" register={register("coating")} error={errors.coating} />
        <FormField label="Required Length" name="requiredLength" register={register("requiredLength")} error={errors.requiredLength} />
        <FormField label="Quantity" name="quantity" register={register("quantity")} error={errors.quantity} />
        <FormField label="Required Breaking Load" name="requiredBreakingLoad" register={register("requiredBreakingLoad")} error={errors.requiredBreakingLoad} />
        <FormField label="Application" name="application" register={register("application")} error={errors.application} />
        <FormField label="Full Name" name="fullName" required register={register("fullName")} error={errors.fullName} />
        <FormField label="Company Name" name="companyName" required register={register("companyName")} error={errors.companyName} />
        <FormField label="Business Email" name="businessEmail" type="email" required register={register("businessEmail")} error={errors.businessEmail} />
        <FormField label="Country" name="country" required register={register("country")} error={errors.country} />
        <FormField label="Phone or WhatsApp" name="phoneOrWhatsapp" register={register("phoneOrWhatsapp")} error={errors.phoneOrWhatsapp} />
      </div>
      <div>
        <label className="block text-sm font-bold text-[#171717]" htmlFor="message">
          Message *
        </label>
        <textarea id="message" rows={6} className="mt-2 w-full border border-[#D8D8D4] p-3" aria-invalid={Boolean(errors.message)} {...register("message")} />
        {errors.message ? <p role="alert" className="mt-1 text-sm text-red-700">{errors.message.message}</p> : null}
      </div>
      <FileUpload register={register("drawingNote")} />
      <input type="hidden" {...register("productSku")} />
      <input type="hidden" {...register("sourcePage")} />
      <input type="hidden" {...register("referrer")} />
      <input type="hidden" {...register("landingPage")} />
      <input type="hidden" {...register("utmSource")} />
      <input type="hidden" {...register("utmMedium")} />
      <input type="hidden" {...register("utmCampaign")} />
      <input type="hidden" {...register("utmContent")} />
      <input type="hidden" {...register("utmTerm")} />
      <label className="flex gap-3 text-sm">
        <input type="checkbox" className="mt-1 h-4 w-4" {...register("privacyConsent")} />
        <span>I agree that Gaoshuo Steel Wire Rope may use this information to respond to my inquiry.</span>
      </label>
      {errors.privacyConsent ? <p role="alert" className="text-sm text-red-700">{errors.privacyConsent.message}</p> : null}
      {serverError ? <p role="alert" className="border border-red-700 p-3 text-sm text-red-700">{serverError}</p> : null}
      <button type="submit" disabled={isSubmitting} className="min-h-12 bg-[#E8820C] px-6 font-bold text-[#171717] disabled:opacity-60">
        {isSubmitting ? "Submitting..." : "Submit RFQ"}
      </button>
    </form>
  );
}
