import React from "react";
import Link from "next/link";
import { SpecificationTable } from "./SpecificationTable";
import {
  isConfirmedSpecificationValue,
  isNotApplicable,
  isTbd,
  type SpecificationField,
  type SpecificationRecord
} from "@/lib/products/specification-model";
import { publicDocumentExists } from "@/lib/products/specifications";

type SpecificationRow = { label: string; value: string | undefined; keyField?: boolean; fields?: readonly SpecificationField[] };
type SpecificationGroup = { title: string; rows: SpecificationRow[] };

function formatRange(minimum: string, maximum: string, unit: string): string {
  if (isNotApplicable(minimum) && isNotApplicable(maximum)) return "N/A";
  if (!isConfirmedSpecificationValue(minimum) || !isConfirmedSpecificationValue(maximum)) return "TBD";
  return minimum === maximum ? `${minimum} ${unit}` : `${minimum}–${maximum} ${unit}`;
}

function formatLoad(value: string, unit: string): string {
  if (isNotApplicable(value)) return "N/A";
  if (!isConfirmedSpecificationValue(value) || !isConfirmedSpecificationValue(unit)) return "TBD";
  return `${value} ${unit}`;
}

function displayValue(value: string | undefined, status: string, keyField = false): string | undefined {
  const normalized = value?.trim() ?? "";
  if (!normalized) return undefined;
  if (isNotApplicable(normalized)) return status === "incomplete" ? undefined : "Not applicable";
  if (isTbd(normalized)) {
    if (status === "reviewed" && keyField) return "To be confirmed for the selected configuration";
    return undefined;
  }
  return normalized;
}

function visibleRows(group: SpecificationGroup, status: string, approximateFields: ReadonlySet<SpecificationField>): { label: string; value: string }[] {
  return group.rows
    .map((row) => {
      const value = displayValue(row.value, status, row.keyField);
      const approximate = row.fields?.some((field) => approximateFields.has(field)) ?? false;
      return {
        label: row.label,
        value: value && approximate ? `${value} — Approximate reference value — final specification subject to confirmation.` : value
      };
    })
    .filter((row): row is { label: string; value: string } => Boolean(row.value));
}

export function TechnicalSpecificationTable({
  specification,
  category,
  approximateFields = []
}: {
  specification?: SpecificationRecord;
  category: string;
  approximateFields?: readonly SpecificationField[];
}) {
  if (!specification || specification.verification_status === "unverified" || specification.verification_status === "rejected") {
    return (
      <div className="border-l-4 border-[#E8820C] bg-[#F5F5F3] p-5 text-sm leading-6 text-[#444]">
        Detailed specifications are being verified. Please submit your drawing or application requirements for confirmation.
      </div>
    );
  }

  const status = specification.verification_status;
  const approximateFieldSet = new Set(approximateFields);
  const groups: SpecificationGroup[] = [];

  if (category !== "wire-rope-fittings") {
    groups.push({
      title: "Wire Rope",
      rows: [
        { label: "Construction", value: specification.construction, keyField: true, fields: ["construction"] },
        { label: "Material", value: specification.material, keyField: true, fields: ["material"] },
        { label: "Material Grade", value: specification.material_grade, keyField: true, fields: ["material_grade"] },
        { label: "Wire Rope Diameter", value: formatRange(specification.wire_rope_diameter_min_mm, specification.wire_rope_diameter_max_mm, "mm"), keyField: true, fields: ["wire_rope_diameter_min_mm", "wire_rope_diameter_max_mm"] },
        { label: "Core", value: specification.core, fields: ["core"] },
        { label: "Lay Direction", value: specification.lay_direction, fields: ["lay_direction"] },
        { label: "Surface Finish", value: specification.surface_finish, fields: ["surface_finish"] }
      ]
    });
  }

  if (!isNotApplicable(specification.coating_material)) {
    groups.push({
      title: "Coating",
      rows: [
        { label: "Coating Material", value: specification.coating_material, fields: ["coating_material"] },
        { label: "Coating Color", value: specification.coating_color, fields: ["coating_color"] },
        { label: "Finished Diameter", value: formatRange(specification.finished_diameter_min_mm, specification.finished_diameter_max_mm, "mm"), fields: ["finished_diameter_min_mm", "finished_diameter_max_mm"] }
      ]
    });
  }

  if (category !== "wire-rope-fittings") {
    const dimensionRows: SpecificationRow[] = [
      { label: "Length Range", value: formatRange(specification.length_min_mm, specification.length_max_mm, "mm"), keyField: true, fields: ["length_min_mm", "length_max_mm"] },
      { label: "Length Tolerance", value: specification.length_tolerance, fields: ["length_tolerance"] }
    ];
    if (category === "tool-safety-lanyards") {
      dimensionRows.push(
        { label: "Retracted Length", value: isConfirmedSpecificationValue(specification.retracted_length_mm) ? `${specification.retracted_length_mm} mm` : specification.retracted_length_mm, fields: ["retracted_length_mm"] },
        { label: "Extended Length", value: isConfirmedSpecificationValue(specification.extended_length_mm) ? `${specification.extended_length_mm} mm` : specification.extended_length_mm, fields: ["extended_length_mm"] }
      );
    }
    groups.push({ title: "Assembly Dimensions", rows: dimensionRows });
  }

  if (["wire-rope-assemblies", "tool-safety-lanyards", "control-brake-cables", "gym-fitness-cables"].includes(category)) {
    groups.push(
      {
        title: "End A",
        rows: [
          { label: "Type", value: specification.end_a_type, keyField: true, fields: ["end_a_type"] },
          { label: "Thread", value: specification.end_a_thread, fields: ["end_a_thread"] },
          { label: "Main Dimensions", value: specification.end_a_dimensions, keyField: true, fields: ["end_a_dimensions"] }
        ]
      },
      {
        title: "End B",
        rows: [
          { label: "Type", value: specification.end_b_type, keyField: true, fields: ["end_b_type"] },
          { label: "Thread", value: specification.end_b_thread, fields: ["end_b_thread"] },
          { label: "Main Dimensions", value: specification.end_b_dimensions, keyField: true, fields: ["end_b_dimensions"] }
        ]
      }
    );
  }

  if (category === "suspension-hanging-kits") {
    groups.push({
      title: "Suspension Components",
      rows: [
        { label: "Upper Fitting", value: specification.upper_fitting, keyField: true, fields: ["upper_fitting"] },
        { label: "Lower Fitting", value: specification.lower_fitting, keyField: true, fields: ["lower_fitting"] },
        { label: "Gripper Type", value: specification.gripper_type, keyField: true, fields: ["gripper_type"] }
      ]
    });
  }

  if (category === "control-brake-cables") {
    groups.push({
      title: "Control Cable",
      rows: [
        { label: "Inner Cable", value: specification.inner_cable, keyField: true, fields: ["inner_cable"] },
        { label: "Outer Casing", value: specification.outer_casing, keyField: true, fields: ["outer_casing"] },
        { label: "Stroke", value: isConfirmedSpecificationValue(specification.stroke_mm) ? `${specification.stroke_mm} mm` : specification.stroke_mm, keyField: true, fields: ["stroke_mm"] }
      ]
    });
  }

  if (category === "wire-rope-fittings") {
    groups.push({
      title: "Fitting Details",
      rows: [
        { label: "Material", value: specification.material, keyField: true, fields: ["material"] },
        { label: "Material Grade", value: specification.material_grade, keyField: true, fields: ["material_grade"] },
        { label: "Surface Finish", value: specification.surface_finish, fields: ["surface_finish"] },
        { label: "Fitting Type", value: specification.end_a_type, keyField: true, fields: ["end_a_type"] },
        { label: "Thread", value: specification.end_a_thread, fields: ["end_a_thread"] },
        { label: "Main Dimensions", value: specification.end_a_dimensions, keyField: true, fields: ["end_a_dimensions"] },
        { label: "Compatible Wire Rope Diameter", value: formatRange(specification.compatible_wire_rope_diameter_min_mm, specification.compatible_wire_rope_diameter_max_mm, "mm"), keyField: true, fields: ["compatible_wire_rope_diameter_min_mm", "compatible_wire_rope_diameter_max_mm"] }
      ]
    });
  }

  const hasRealLoad = isConfirmedSpecificationValue(specification.breaking_load) || isConfirmedSpecificationValue(specification.working_load);
  if (hasRealLoad) {
    groups.push({
      title: "Load Data",
      rows: [
        { label: "Minimum Breaking Load", value: formatLoad(specification.breaking_load, specification.load_unit), keyField: true, fields: ["breaking_load", "load_unit"] },
        { label: "Working Load", value: formatLoad(specification.working_load, specification.load_unit), keyField: true, fields: ["working_load", "load_unit"] }
      ]
    });
  }

  groups.push(
    {
      title: "Commercial Information",
      rows: [
        { label: "Applicable Standard", value: specification.applicable_standard, keyField: true, fields: ["applicable_standard"] },
        { label: "MOQ", value: specification.moq, fields: ["moq"] },
        { label: "Sample Lead Time", value: specification.sample_lead_time, fields: ["sample_lead_time"] },
        { label: "Production Lead Time", value: specification.production_lead_time, fields: ["production_lead_time"] },
        { label: "Packaging", value: specification.packaging, fields: ["packaging"] }
      ]
    },
    {
      title: "Customization",
      rows: [{ label: "Customization Options", value: isConfirmedSpecificationValue(specification.customization_options) ? specification.customization_options.split(";").join(", ") : specification.customization_options, fields: ["customization_options"] }]
    }
  );

  const displayGroups = groups
    .map((group) => ({ title: group.title, rows: visibleRows(group, status, approximateFieldSet) }))
    .filter((group) => group.rows.length > 0);
  const documents = [
    { label: "Drawing", path: specification.drawing_file },
    { label: "Datasheet", path: specification.datasheet_file }
  ].filter((document) => publicDocumentExists(document.path));

  return (
    <div className="grid gap-6">
      {status === "reviewed" ? <p className="border-l-4 border-[#E8820C] bg-[#F5F5F3] p-4 text-sm">Specifications are subject to final order confirmation.</p> : null}
      {status === "incomplete" ? <p className="border-l-4 border-[#E8820C] bg-[#F5F5F3] p-4 text-sm">Some specifications require confirmation based on the selected configuration.</p> : null}
      <div className="grid gap-6 md:grid-cols-2">
        {displayGroups.map((group) => <SpecificationTable key={group.title} caption={group.title} rows={group.rows} />)}
      </div>
      {!hasRealLoad ? <p className="text-sm leading-6 text-[#555]">Load data has not been verified for this configuration. Please include the required load and application in your inquiry.</p> : null}
      {documents.length > 0 ? (
        <div>
          <h3 className="font-bold text-[#171717]">Documents</h3>
          <div className="mt-3 flex flex-wrap gap-3">
            {documents.map((document) => <Link className="border border-[#171717] px-4 py-3 text-sm font-bold hover:border-[#E8820C]" href={document.path} key={document.label}>{document.label}</Link>)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
