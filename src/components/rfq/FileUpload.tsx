import type { UseFormRegisterReturn } from "react-hook-form";

export function FileUpload({ register }: { register: UseFormRegisterReturn }) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#171717]" htmlFor="drawing">
        Drawing or Specification
      </label>
      <input id="drawing" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="mt-2 w-full border border-[#D8D8D4] p-3" {...register} />
      <p className="mt-1 text-sm text-[#555]">Accepted files: PDF, JPG, JPEG, PNG. Maximum size: 5 MB.</p>
    </div>
  );
}
