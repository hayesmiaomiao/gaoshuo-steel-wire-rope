"use client";

import { useState, type FormEvent } from "react";
import styles from "./RFQForm.module.css";

const fields = [
  ["productType", "Product Type"],
  ["application", "Application"],
  ["diameter", "Wire Rope Diameter"],
  ["material", "Material"],
  ["coating", "Coating"],
  ["overallLength", "Overall Length"],
  ["endFittingA", "End Fitting A"],
  ["endFittingB", "End Fitting B"],
  ["quantity", "Quantity"],
  ["company", "Company"],
  ["fullName", "Full Name"],
  ["businessEmail", "Business Email"],
  ["country", "Country"],
  ["phone", "Phone or WhatsApp"]
] as const;

export function RFQForm({ defaultProduct = "" }: { defaultProduct?: string }) {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.grid}>
        {fields.map(([name, label]) => (
          <label key={name}>
            <span>{label}{["fullName", "businessEmail", "company", "country"].includes(name) ? " *" : ""}</span>
            <input
              defaultValue={name === "productType" ? defaultProduct : undefined}
              name={name}
              required={["fullName", "businessEmail", "company", "country"].includes(name)}
              type={name === "businessEmail" ? "email" : "text"}
            />
          </label>
        ))}
      </div>
      <label>
        <span>Message *</span>
        <textarea name="message" required rows={6} />
      </label>
      <button className="button buttonAccent" type="submit">
        Submit Inquiry
      </button>
      {submitted ? (
        <p className={styles.notice} role="status">
          Online inquiry delivery is being configured. Please contact us after the official email address is published.
        </p>
      ) : null}
    </form>
  );
}
