import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { parseCsvRecords } from "../src/lib/csv";

type StyleIssue = {
  route: string;
  kind:
    | "navigation"
    | "missing-stylesheet"
    | "stylesheet-status"
    | "stylesheet-mime"
    | "stylesheet-empty"
    | "stylesheet-html"
    | "console.error"
    | "pageerror"
    | "requestfailed"
    | "computed-style";
  message: string;
  url?: string;
};

const baseUrl = (process.env.PRODUCTION_TEST_BASE_URL ?? "http://127.0.0.1:3109").replace(/\/$/, "");
const productRows = parseCsvRecords(
  readFileSync(path.join(process.cwd(), "data", "products.csv"), "utf8")
).records;
const productRoutes = productRows
  .filter((product) => product.status === "published" && product.publishable === "true")
  .slice(0, 10)
  .map((product) => `/products/${product.slug}`);

const categoryRoutes = [
  "/products/wire-rope-assemblies",
  "/products/tool-safety-lanyards",
  "/products/suspension-hanging-kits",
  "/products/control-brake-cables",
  "/products/gym-fitness-cables",
  "/products/wire-rope-fittings"
];

const routes = [
  "/",
  "/products",
  ...categoryRoutes,
  ...productRoutes,
  "/services/custom-wire-rope-assemblies",
  "/about",
  "/request-a-quote"
];

test.use({ channel: "chrome", headless: true, viewport: { width: 1440, height: 1000 } });

test("production pages load complete CSS with expected computed styles", async ({ context, request }, testInfo) => {
  test.setTimeout(10 * 60 * 1000);
  const issues: StyleIssue[] = [];
  let cssResponsesChecked = 0;

  for (const route of routes) {
    const page = await context.newPage();

    page.on("console", (message) => {
      if (message.type() !== "error") return;
      issues.push({ route, kind: "console.error", message: message.text(), url: message.location().url });
    });
    page.on("pageerror", (error) => {
      issues.push({ route, kind: "pageerror", message: error.stack ?? error.message });
    });
    page.on("requestfailed", (failedRequest) => {
      issues.push({
        route,
        kind: "requestfailed",
        message: failedRequest.failure()?.errorText ?? "Request failed without an error message",
        url: failedRequest.url()
      });
    });

    try {
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      if (!response || response.status() !== 200) {
        issues.push({ route, kind: "navigation", message: `Expected HTTP 200, received ${response?.status() ?? "no response"}.` });
      }
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
    } catch (error) {
      issues.push({
        route,
        kind: "navigation",
        message: error instanceof Error ? error.stack ?? error.message : String(error)
      });
    }

    const stylesheetUrls = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map((link) => link.href)
    ).catch(() => [] as string[]);

    if (stylesheetUrls.length === 0) {
      issues.push({ route, kind: "missing-stylesheet", message: "No stylesheet link was present in the document head." });
    }

    for (const stylesheetUrl of [...new Set(stylesheetUrls)]) {
      const cssResponse = await request.get(stylesheetUrl, { failOnStatusCode: false });
      const body = await cssResponse.body();
      const contentType = cssResponse.headers()["content-type"] ?? "";
      cssResponsesChecked += 1;

      if (cssResponse.status() !== 200) {
        issues.push({ route, kind: "stylesheet-status", message: `Stylesheet returned HTTP ${cssResponse.status()}.`, url: stylesheetUrl });
      }
      if (!contentType.toLowerCase().includes("text/css")) {
        issues.push({ route, kind: "stylesheet-mime", message: `Stylesheet returned Content-Type ${contentType || "missing"}.`, url: stylesheetUrl });
      }
      if (body.length === 0) {
        issues.push({ route, kind: "stylesheet-empty", message: "Stylesheet response body was empty.", url: stylesheetUrl });
      }
      if (/^\s*(?:<!doctype html|<html)/i.test(body.toString("utf8"))) {
        issues.push({ route, kind: "stylesheet-html", message: "Stylesheet request returned an HTML document.", url: stylesheetUrl });
      }
    }

    if (route === "/") {
      const computed = await page.evaluate(() => {
        const header = document.querySelector("header");
        const navigation = document.querySelector('nav[aria-label="Main navigation"]');
        const heroCta = document.querySelector('main section a[href="/request-a-quote"]');
        const footer = document.querySelector("footer");
        const featuredHeading = Array.from(document.querySelectorAll("h2")).find((heading) => heading.textContent?.trim() === "Featured Products");
        const featuredGrid = featuredHeading?.closest("section")?.querySelector(".grid");
        const body = getComputedStyle(document.body);

        return {
          bodyFont: body.fontFamily,
          bodyMargin: body.margin,
          headerPosition: header ? getComputedStyle(header).position : "missing",
          navigationDisplay: navigation ? getComputedStyle(navigation).display : "missing",
          heroCtaBackground: heroCta ? getComputedStyle(heroCta).backgroundColor : "missing",
          featuredGridDisplay: featuredGrid ? getComputedStyle(featuredGrid).display : "missing",
          footerBackground: footer ? getComputedStyle(footer).backgroundColor : "missing"
        };
      });

      const computedFailures = [
        !computed.bodyFont.toLowerCase().includes("times new roman") ? "" : `Body font is ${computed.bodyFont}.`,
        computed.bodyMargin === "0px" ? "" : `Body margin is ${computed.bodyMargin}.`,
        computed.headerPosition === "sticky" ? "" : `Header position is ${computed.headerPosition}.`,
        computed.navigationDisplay === "flex" ? "" : `Desktop navigation display is ${computed.navigationDisplay}.`,
        computed.heroCtaBackground === "rgb(232, 130, 12)" ? "" : `Hero CTA background is ${computed.heroCtaBackground}.`,
        computed.featuredGridDisplay === "grid" ? "" : `Featured Products display is ${computed.featuredGridDisplay}.`,
        computed.footerBackground === "rgb(23, 23, 23)" ? "" : `Footer background is ${computed.footerBackground}.`
      ].filter(Boolean);

      for (const message of computedFailures) issues.push({ route, kind: "computed-style", message });
    }

    await page.close();
  }

  await testInfo.attach("production-style-results.json", {
    body: Buffer.from(JSON.stringify({ baseUrl, routes, cssResponsesChecked, issues }, null, 2)),
    contentType: "application/json"
  });

  if (issues.length > 0) console.error(JSON.stringify({ baseUrl, routesChecked: routes.length, cssResponsesChecked, issues }, null, 2));
  expect(issues, `CSS failures detected while checking ${routes.length} routes`).toEqual([]);
});
