import { afterEach, describe, expect, it, vi } from "vitest";
import sitemap from "../app/sitemap";
import { createMetadata } from "@/lib/seo/metadata";
import { readResources } from "@/lib/content/resources";

describe("SEO and content", () => {
  afterEach(() => {
    delete process.env.STAGING_NOINDEX;
    vi.resetModules();
  });

  it("excludes draft products from sitemap", () => {
    const urls = sitemap().map((item) => item.url);
    expect(urls.some((url) => url.includes("7x7-stainless-steel-wire-rope"))).toBe(false);
  });

  it("keeps draft resources noindex", () => {
    const { resources, errors } = readResources();
    expect(errors).toEqual([]);
    expect(resources.every((resource) => resource.status === "published" || resource.noindex)).toBe(true);
  });

  it("generates canonical metadata", () => {
    const metadata = createMetadata({ title: "Test Page", description: "Test description", path: "/test" });
    expect(metadata.alternates?.canonical).toBeDefined();
  });

  it("keeps production pages indexable when staging noindex is disabled", async () => {
    delete process.env.STAGING_NOINDEX;
    vi.resetModules();
    const { createMetadata: createFreshMetadata } = await import("@/lib/seo/metadata");

    const metadata = createFreshMetadata({ title: "Indexable Page", description: "Indexable description", path: "/indexable" });

    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it("sets all metadata to noindex and nofollow when staging noindex is enabled", async () => {
    process.env.STAGING_NOINDEX = "true";
    vi.resetModules();
    const { createMetadata: createFreshMetadata } = await import("@/lib/seo/metadata");

    const metadata = createFreshMetadata({ title: "Staging Page", description: "Staging description", path: "/staging" });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBeDefined();
  });

  it("keeps thank-you style pages noindex even when staging noindex is disabled", async () => {
    delete process.env.STAGING_NOINDEX;
    vi.resetModules();
    const { createMetadata: createFreshMetadata } = await import("@/lib/seo/metadata");

    const metadata = createFreshMetadata({
      title: "Thank You",
      description: "Inquiry confirmation page.",
      path: "/thank-you",
      noindex: true
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("disallows all crawlers in robots when staging noindex is enabled", async () => {
    process.env.STAGING_NOINDEX = "true";
    vi.resetModules();
    const { default: robots } = await import("../app/robots");

    const rules = robots().rules;

    expect(Array.isArray(rules) ? rules[0] : rules).toMatchObject({
      userAgent: "*",
      disallow: "/"
    });
  });
});
