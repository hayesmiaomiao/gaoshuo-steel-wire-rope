import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

type FormFieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  register: UseFormRegisterReturn;
  error?: FieldError;
  placeholder?: string;
};

export function FormField({ label, name, type = "text", required = false, register, error, placeholder }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#171717]" htmlFor={name}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="mt-2 min-h-12 w-full border border-[#D8D8D4] px-3"
        {...register}
      />
      {error ? (
        <p id={`${name}-error`} role="alert" className="mt-1 text-sm text-red-700">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}
