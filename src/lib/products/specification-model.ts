export const BASE_SPECIFICATION_HEADERS = [
  "sku",
  "product_slug",
  "product_name",
  "construction",
  "material",
  "material_grade",
  "wire_rope_diameter_min_mm",
  "wire_rope_diameter_max_mm",
  "coating_material",
  "coating_color",
  "finished_diameter_min_mm",
  "finished_diameter_max_mm",
  "length_min_mm",
  "length_max_mm",
  "length_tolerance",
  "core",
  "lay_direction",
  "surface_finish",
  "end_a_type",
  "end_a_thread",
  "end_a_dimensions",
  "end_b_type",
  "end_b_thread",
  "end_b_dimensions",
  "breaking_load",
  "working_load",
  "load_unit",
  "applicable_standard",
  "moq",
  "sample_lead_time",
  "production_lead_time",
  "packaging",
  "customization_options",
  "drawing_file",
  "datasheet_file",
  "verification_status",
  "reviewed_by",
  "reviewed_at",
  "notes"
] as const;

export const CATEGORY_SPECIFICATION_HEADERS = [
  "retracted_length_mm",
  "extended_length_mm",
  "upper_fitting",
  "lower_fitting",
  "gripper_type",
  "inner_cable",
  "outer_casing",
  "stroke_mm",
  "compatible_wire_rope_diameter_min_mm",
  "compatible_wire_rope_diameter_max_mm"
] as const;

export const SPECIFICATION_HEADERS = [...BASE_SPECIFICATION_HEADERS, ...CATEGORY_SPECIFICATION_HEADERS] as const;

export type SpecificationField = (typeof SPECIFICATION_HEADERS)[number];
export type SpecificationRecord = Record<SpecificationField, string>;
export type SpecificationVerificationStatus = "unverified" | "incomplete" | "reviewed" | "approved" | "rejected";
export type SpecificationPublishRisk = "low" | "medium" | "high" | "critical";

export const SPECIFICATION_STATUSES: readonly SpecificationVerificationStatus[] = ["unverified", "incomplete", "reviewed", "approved", "rejected"];
export const LOAD_UNITS = ["N", "kN", "kgf", "lbf", "N/A", "TBD"] as const;

export const CHINESE_HEADER_MAP: Record<SpecificationField, string> = {
  sku: "SKU",
  product_slug: "产品Slug",
  product_name: "产品名称",
  construction: "钢丝绳结构",
  material: "材质",
  material_grade: "材质牌号",
  wire_rope_diameter_min_mm: "钢丝绳最小直径mm",
  wire_rope_diameter_max_mm: "钢丝绳最大直径mm",
  coating_material: "包胶材质",
  coating_color: "包胶颜色",
  finished_diameter_min_mm: "包胶后最小直径mm",
  finished_diameter_max_mm: "包胶后最大直径mm",
  length_min_mm: "最小长度mm",
  length_max_mm: "最大长度mm",
  length_tolerance: "长度公差",
  core: "芯材",
  lay_direction: "捻向",
  surface_finish: "表面处理",
  end_a_type: "A端类型",
  end_a_thread: "A端螺纹",
  end_a_dimensions: "A端主要尺寸",
  end_b_type: "B端类型",
  end_b_thread: "B端螺纹",
  end_b_dimensions: "B端主要尺寸",
  breaking_load: "最小破断拉力",
  working_load: "工作载荷",
  load_unit: "载荷单位",
  applicable_standard: "适用标准",
  moq: "MOQ",
  sample_lead_time: "样品交期",
  production_lead_time: "批量交期",
  packaging: "包装方式",
  customization_options: "可定制项目",
  drawing_file: "图纸文件",
  datasheet_file: "数据表文件",
  verification_status: "验证状态",
  reviewed_by: "审核人",
  reviewed_at: "审核日期",
  notes: "备注",
  retracted_length_mm: "收缩长度mm",
  extended_length_mm: "伸展长度mm",
  upper_fitting: "上端配件",
  lower_fitting: "下端配件",
  gripper_type: "夹持器类型",
  inner_cable: "内芯钢丝",
  outer_casing: "外护套",
  stroke_mm: "行程mm",
  compatible_wire_rope_diameter_min_mm: "适配钢丝绳最小直径mm",
  compatible_wire_rope_diameter_max_mm: "适配钢丝绳最大直径mm"
};

export const CHINESE_SPECIFICATION_HEADERS = SPECIFICATION_HEADERS.map((field) => CHINESE_HEADER_MAP[field]);

const metadataFields = new Set<SpecificationField>([
  "sku",
  "product_slug",
  "product_name",
  "verification_status",
  "reviewed_by",
  "reviewed_at",
  "notes"
]);

export const SPECIFICATION_DATA_FIELDS = SPECIFICATION_HEADERS.filter((field) => !metadataFields.has(field));

export const NUMERIC_SPECIFICATION_FIELDS = [
  "wire_rope_diameter_min_mm",
  "wire_rope_diameter_max_mm",
  "finished_diameter_min_mm",
  "finished_diameter_max_mm",
  "length_min_mm",
  "length_max_mm",
  "breaking_load",
  "working_load",
  "retracted_length_mm",
  "extended_length_mm",
  "stroke_mm",
  "compatible_wire_rope_diameter_min_mm",
  "compatible_wire_rope_diameter_max_mm"
] as const satisfies readonly SpecificationField[];

export const MIN_MAX_FIELD_PAIRS = [
  ["wire_rope_diameter_min_mm", "wire_rope_diameter_max_mm"],
  ["finished_diameter_min_mm", "finished_diameter_max_mm"],
  ["length_min_mm", "length_max_mm"],
  ["compatible_wire_rope_diameter_min_mm", "compatible_wire_rope_diameter_max_mm"]
] as const satisfies readonly (readonly [SpecificationField, SpecificationField])[];

const categoryExtras: Record<string, readonly SpecificationField[]> = {
  "tool-safety-lanyards": ["retracted_length_mm", "extended_length_mm"],
  "suspension-hanging-kits": ["upper_fitting", "lower_fitting", "gripper_type"],
  "control-brake-cables": ["inner_cable", "outer_casing", "stroke_mm"],
  "wire-rope-fittings": ["compatible_wire_rope_diameter_min_mm", "compatible_wire_rope_diameter_max_mm"]
};

const fittingNotApplicableFields: readonly SpecificationField[] = [
  "construction",
  "wire_rope_diameter_min_mm",
  "wire_rope_diameter_max_mm",
  "coating_material",
  "coating_color",
  "finished_diameter_min_mm",
  "finished_diameter_max_mm",
  "length_min_mm",
  "length_max_mm",
  "length_tolerance",
  "core",
  "lay_direction",
  "end_b_type",
  "end_b_thread",
  "end_b_dimensions"
];

export function createSpecificationTemplate(product: { sku: string; slug: string; product_name: string; category: string }): SpecificationRecord {
  const record = Object.fromEntries(SPECIFICATION_HEADERS.map((field) => [field, "TBD"])) as SpecificationRecord;
  record.sku = product.sku;
  record.product_slug = product.slug;
  record.product_name = product.product_name;
  record.verification_status = "unverified";
  record.reviewed_by = "";
  record.reviewed_at = "";

  const applicableExtras = new Set(categoryExtras[product.category] ?? []);
  for (const field of CATEGORY_SPECIFICATION_HEADERS) {
    if (!applicableExtras.has(field)) record[field] = "N/A";
  }

  if (product.category === "wire-rope-fittings") {
    for (const field of fittingNotApplicableFields) record[field] = "N/A";
  }

  return record;
}

export function isTbd(value: string | undefined): boolean {
  return value?.trim() === "TBD";
}

export function isNotApplicable(value: string | undefined): boolean {
  return value?.trim() === "N/A";
}

export function isConfirmedSpecificationValue(value: string | undefined): boolean {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 && normalized !== "TBD" && normalized !== "N/A";
}

export function isDisplayableSpecificationStatus(status: string): status is "incomplete" | "reviewed" | "approved" {
  return status === "incomplete" || status === "reviewed" || status === "approved";
}

export function getApplicableSpecificationFields(category: string): readonly SpecificationField[] {
  const common: SpecificationField[] = [
    "material",
    "material_grade",
    "surface_finish",
    "breaking_load",
    "working_load",
    "load_unit",
    "applicable_standard",
    "moq",
    "sample_lead_time",
    "production_lead_time",
    "packaging",
    "customization_options",
    "drawing_file",
    "datasheet_file"
  ];

  const byCategory: Record<string, SpecificationField[]> = {
    "wire-rope-assemblies": ["construction", "wire_rope_diameter_min_mm", "wire_rope_diameter_max_mm", "coating_material", "coating_color", "finished_diameter_min_mm", "finished_diameter_max_mm", "length_min_mm", "length_max_mm", "length_tolerance", "core", "lay_direction", "end_a_type", "end_a_thread", "end_a_dimensions", "end_b_type", "end_b_thread", "end_b_dimensions"],
    "tool-safety-lanyards": ["wire_rope_diameter_min_mm", "wire_rope_diameter_max_mm", "coating_material", "coating_color", "finished_diameter_min_mm", "finished_diameter_max_mm", "length_min_mm", "length_max_mm", "length_tolerance", "end_a_type", "end_a_thread", "end_a_dimensions", "end_b_type", "end_b_thread", "end_b_dimensions", "retracted_length_mm", "extended_length_mm"],
    "suspension-hanging-kits": ["wire_rope_diameter_min_mm", "wire_rope_diameter_max_mm", "coating_material", "coating_color", "finished_diameter_min_mm", "finished_diameter_max_mm", "length_min_mm", "length_max_mm", "length_tolerance", "upper_fitting", "lower_fitting", "gripper_type"],
    "control-brake-cables": ["coating_material", "coating_color", "finished_diameter_min_mm", "finished_diameter_max_mm", "length_min_mm", "length_max_mm", "length_tolerance", "end_a_type", "end_a_thread", "end_a_dimensions", "end_b_type", "end_b_thread", "end_b_dimensions", "inner_cable", "outer_casing", "stroke_mm"],
    "gym-fitness-cables": ["construction", "wire_rope_diameter_min_mm", "wire_rope_diameter_max_mm", "coating_material", "coating_color", "finished_diameter_min_mm", "finished_diameter_max_mm", "length_min_mm", "length_max_mm", "length_tolerance", "core", "lay_direction", "end_a_type", "end_a_thread", "end_a_dimensions", "end_b_type", "end_b_thread", "end_b_dimensions"],
    "wire-rope-fittings": ["end_a_type", "end_a_thread", "end_a_dimensions", "compatible_wire_rope_diameter_min_mm", "compatible_wire_rope_diameter_max_mm"]
  };

  return [...new Set([...common, ...(byCategory[category] ?? SPECIFICATION_DATA_FIELDS)])];
}

function groupMissing(record: SpecificationRecord, fields: readonly SpecificationField[]): boolean {
  return !fields.some((field) => isConfirmedSpecificationValue(record[field]));
}

export function getMissingCriticalFields(record: SpecificationRecord, category: string): string[] {
  const groups: { label: string; fields: readonly SpecificationField[]; categories?: readonly string[] }[] = [
    { label: "material", fields: ["material"] },
    { label: "material_grade", fields: ["material_grade"] },
    { label: "construction", fields: ["construction"], categories: ["wire-rope-assemblies", "gym-fitness-cables"] },
    { label: "diameter", fields: category === "wire-rope-fittings" ? ["compatible_wire_rope_diameter_min_mm", "compatible_wire_rope_diameter_max_mm"] : ["wire_rope_diameter_min_mm", "wire_rope_diameter_max_mm"] },
    { label: "length", fields: category === "tool-safety-lanyards" ? ["length_min_mm", "length_max_mm", "retracted_length_mm", "extended_length_mm"] : category === "wire-rope-fittings" ? ["end_a_dimensions"] : ["length_min_mm", "length_max_mm"] },
    { label: "end_fittings", fields: category === "suspension-hanging-kits" ? ["upper_fitting", "lower_fitting", "gripper_type"] : ["end_a_type", "end_b_type"] },
    { label: "load", fields: ["breaking_load", "working_load"] },
    { label: "standard", fields: ["applicable_standard"] },
    { label: "moq", fields: ["moq"] },
    { label: "lead_time", fields: ["sample_lead_time", "production_lead_time"] }
  ];

  return groups
    .filter((group) => !group.categories || group.categories.includes(category))
    .filter((group) => groupMissing(record, group.fields))
    .map((group) => group.label);
}

export function getSpecificationPublishRisk(record: SpecificationRecord, category: string): SpecificationPublishRisk {
  if (record.verification_status === "rejected") return "critical";
  const missing = new Set(getMissingCriticalFields(record, category));
  const highImpactMissing = ["material", "diameter", "length", "end_fittings", "load", "standard"].filter((field) => missing.has(field)).length;
  if (highImpactMissing >= 5 || (missing.has("load") && missing.has("standard") && highImpactMissing >= 3)) return "critical";
  if (highImpactMissing >= 3 || missing.size >= 5) return "high";
  if (missing.size > 0 || record.verification_status === "unverified" || record.verification_status === "incomplete") return "medium";
  return "low";
}
