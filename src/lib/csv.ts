export type CsvRecord = Record<string, string>;

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  return rows;
}

export function parseCsvRecords(text: string): { headers: string[]; records: CsvRecord[] } {
  const rows = parseCsv(text);
  const headers = rows[0] ?? [];
  const records = rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
  return { headers, records };
}

export function escapeCsvCell(value: string): string {
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export function serializeCsv(headers: readonly string[], records: readonly CsvRecord[]): string {
  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const record of records) {
    lines.push(headers.map((header) => escapeCsvCell(record[header] ?? "")).join(","));
  }
  return `${lines.join("\n")}\n`;
}
