import React from "react";

type SpecificationTableProps = {
  caption: string;
  rows: { label: string; value: string | string[] | undefined }[];
};

export function SpecificationTable({ caption, rows }: SpecificationTableProps) {
  const visibleRows = rows
    .map((row) => ({
      label: row.label,
      value: Array.isArray(row.value) ? row.value.join(", ") : row.value
    }))
    .filter((row) => row.value && row.value.trim().length > 0);

  if (visibleRows.length === 0) {
    return <p className="text-sm text-[#555]">Contact our team to confirm the specification.</p>;
  }

  return (
    <table className="industrial-table">
      <caption className="mb-3 text-left font-bold text-[#171717]">{caption}</caption>
      <tbody>
        {visibleRows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
