import fs from "node:fs";
import path from "node:path";

const scanRoots = ["app", "src", "content", "data", "knowledge", "tests", "scripts"].map((root) => path.join(process.cwd(), root));
const standaloneFiles = ["README.md", "AGENTS.md", ".env.example", "package.json"].map((file) => path.join(process.cwd(), file));
const blockedTerms = [
  "justwirerope.com",
  "wireropeassy.com",
  "Just Wire Rope",
  "Wire Rope Assy",
  "Guofeng"
];

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(tsx|ts|md|json|csv)$/.test(entry.name) ? [full] : [];
  });
}

const errors: string[] = [];

for (const file of [...scanRoots.flatMap(walk), ...standaloneFiles.filter((file) => fs.existsSync(file))]) {
  const relative = path.relative(process.cwd(), file);
  if (relative.startsWith("research\\")) continue;
  if (relative === path.join("scripts", "check-brand-migration.ts") || relative === path.join("scripts", "check-contact-leaks.ts")) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const term of blockedTerms) {
    if (!text.toLowerCase().includes(term.toLowerCase())) continue;
    errors.push(`${relative} contains blocked source brand/domain term: ${term}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Brand migration checks passed.");
