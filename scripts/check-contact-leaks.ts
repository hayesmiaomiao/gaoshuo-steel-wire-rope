import fs from "node:fs";
import path from "node:path";

const scanRoots = ["app", "src", "content", "data"].map((root) => path.join(process.cwd(), root));
const blockedPatterns = [
  { label: "source domain email", pattern: /[A-Z0-9._%+-]+@(justwirerope|wireropeassy)\.[A-Z]{2,}/gi },
  { label: "source WhatsApp text", pattern: /(?:justwirerope|wireropeassy).{0,80}whatsapp|whatsapp.{0,80}(?:justwirerope|wireropeassy)/gi },
  { label: "source phone text", pattern: /(?:justwirerope|wireropeassy).{0,80}(?:phone|tel|mobile)|(?:phone|tel|mobile).{0,80}(?:justwirerope|wireropeassy)/gi },
  { label: "source map link", pattern: /(?:google\.com\/maps|maps\.app\.goo\.gl).{0,120}(?:justwirerope|wireropeassy)/gi },
  { label: "source social link", pattern: /(?:facebook|linkedin|youtube|twitter|x\.com|instagram)\.com\/[^\\s"']*(?:justwirerope|wireropeassy)/gi }
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

for (const file of scanRoots.flatMap(walk)) {
  const relative = path.relative(process.cwd(), file);
  const text = fs.readFileSync(file, "utf8");
  for (const blocked of blockedPatterns) {
    if (blocked.pattern.test(text)) errors.push(`${relative} may contain ${blocked.label}`);
    blocked.pattern.lastIndex = 0;
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Contact leak checks passed.");
