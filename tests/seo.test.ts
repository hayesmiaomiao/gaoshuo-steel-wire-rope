import { describe, expect, it } from "vitest";
import { createMetadata, isStagingNoindex } from "@/lib/seo/metadata";

describe("SEO environment policy", () => {
  it("blocks indexing only when staging is explicitly enabled", () => {
    expect(isStagingNoindex("true")).toBe(true);
    expect(isStagingNoindex("false")).toBe(false);
    const previous = process.env.STAGING_NOINDEX;
    delete process.env.STAGING_NOINDEX;
    expect(isStagingNoindex()).toBe(false);
    if (previous === undefined) delete process.env.STAGING_NOINDEX;
    else process.env.STAGING_NOINDEX = previous;
  });

  it("creates canonical and Open Graph metadata", () => {
    const previousNoindex = process.env.STAGING_NOINDEX;
    const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.STAGING_NOINDEX = "true";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
    const metadata = createMetadata({ title: "Test Page", description: "Test description", path: "/test" });
    expect(metadata.alternates?.canonical).toBe("https://example.test/test");
    expect(metadata.openGraph).toBeTruthy();
    expect(metadata.robots).toEqual({ index: false, follow: false });
    if (previousNoindex === undefined) delete process.env.STAGING_NOINDEX;
    else process.env.STAGING_NOINDEX = previousNoindex;
    if (previousSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
  });
});
