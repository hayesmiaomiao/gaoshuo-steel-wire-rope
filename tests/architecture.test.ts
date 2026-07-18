import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function sourceFiles(directory: string): string[] {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(relative) : /\.(ts|tsx|css)$/.test(entry.name) ? [relative] : [];
  });
}

describe("stable architecture", () => {
  it("limits client boundaries to interactive UI and the required Next error boundary", () => {
    const clientFiles = [...sourceFiles("app"), ...sourceFiles("components")]
      .filter((file) => fs.readFileSync(path.join(root, file), "utf8").startsWith('"use client"'))
      .map((file) => file.replaceAll("\\", "/"))
      .sort();
    expect(clientFiles).toEqual([
      "app/error.tsx",
      "components/forms/RFQForm.tsx",
      "components/layout/MobileNavigation.tsx",
      "components/product/ProductGallery.tsx"
    ]);
  });

  it("does not use prohibited styling or deployment configuration", () => {
    const files = [...sourceFiles("app"), ...sourceFiles("components"), ...sourceFiles("lib")];
    const source = files.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
    const packageJson = fs.readFileSync(path.join(root, "package.json"), "utf8");
    const nextConfig = fs.readFileSync(path.join(root, "next.config.ts"), "utf8");
    expect(source).not.toMatch(/@tailwind|tailwindcss|styled-components|framer-motion|next-pwa|service-worker/i);
    expect(packageJson).not.toMatch(/tailwindcss|@tailwindcss\/postcss|styled-components|framer-motion|redux|zustand/i);
    expect(nextConfig).not.toMatch(/assetPrefix|basePath|output\s*:\s*["']export["']/);
  });

  it("keeps JSON and filesystem imports out of client components", () => {
    const clientFiles = [
      "components/forms/RFQForm.tsx",
      "components/layout/MobileNavigation.tsx",
      "components/product/ProductGallery.tsx"
    ];
    for (const file of clientFiles) {
      const source = fs.readFileSync(path.join(root, file), "utf8");
      expect(source).not.toMatch(/from\s+["'][^"']*data\/|\.json["']|node:fs|node:path/);
    }
  });
});
