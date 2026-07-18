import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { parseCsvRecords } from "../src/lib/csv";

type ClientIssue = {
  route: string;
  kind: "console.error" | "pageerror" | "requestfailed" | "http-error" | "navigation" | "application-error";
  message: string;
  url?: string;
  status?: number;
  stack?: string;
};

type ServiceRecord = {
  slug: string;
  status: string;
  publishable: boolean;
};

const projectRoot = process.cwd();
const baseUrl = (process.env.PRODUCTION_TEST_BASE_URL ?? "http://127.0.0.1:3109").replace(/\/$/, "");

const productRows = parseCsvRecords(
  readFileSync(path.join(projectRoot, "data", "products.csv"), "utf8")
).records;
const productRoutes = productRows
  .filter((product) => product.status === "published" && product.publishable === "true")
  .map((product) => `/products/${product.slug}`);

const serviceRows = JSON.parse(
  readFileSync(path.join(projectRoot, "data", "services.json"), "utf8")
) as ServiceRecord[];
const serviceRoutes = serviceRows
  .filter((service) => service.status === "published" && service.publishable)
  .map((service) => `/services/${service.slug}`);

const applicationRoutes = [
  "marine",
  "crane-and-lifting",
  "architectural",
  "security-cables",
  "control-cables",
  "fitness-equipment",
  "industrial-assemblies"
].map((slug) => `/applications/${slug}`);

const routes = [
  "/",
  "/products",
  ...productRoutes,
  "/request-a-quote",
  "/about",
  "/services",
  ...serviceRoutes,
  "/applications",
  ...applicationRoutes
];

test.use({ channel: "chrome", headless: true });

test("production pages have no client-side runtime errors", async ({ page }, testInfo) => {
  test.setTimeout(10 * 60 * 1000);
  const issues: ClientIssue[] = [];
  let currentRoute = "/";

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const location = message.location();
    issues.push({
      route: currentRoute,
      kind: "console.error",
      message: message.text(),
      url: location.url
    });
  });

  page.on("pageerror", (error) => {
    issues.push({
      route: currentRoute,
      kind: "pageerror",
      message: error.message,
      stack: error.stack
    });
  });

  page.on("requestfailed", (request) => {
    issues.push({
      route: currentRoute,
      kind: "requestfailed",
      message: request.failure()?.errorText ?? "Request failed without an error message",
      url: request.url()
    });
  });

  page.on("response", (response) => {
    if (response.status() < 400) return;
    issues.push({
      route: currentRoute,
      kind: "http-error",
      message: `${response.status()} ${response.statusText()}`.trim(),
      status: response.status(),
      url: response.url()
    });
  });

  for (const route of routes) {
    currentRoute = route;
    try {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
      await page.waitForTimeout(750);
    } catch (error) {
      issues.push({
        route,
        kind: "navigation",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    const applicationError = await page
      .getByText("Application error: a client-side exception has occurred", { exact: false })
      .count();
    if (applicationError > 0) {
      issues.push({
        route,
        kind: "application-error",
        message: "Next.js rendered the production client-side exception fallback."
      });
    }
  }

  await testInfo.attach("production-client-errors.json", {
    body: Buffer.from(JSON.stringify({ baseUrl, routes, issues }, null, 2)),
    contentType: "application/json"
  });

  if (issues.length > 0) {
    console.error(JSON.stringify({ baseUrl, routesChecked: routes.length, issues }, null, 2));
  }

  expect(issues, `Client errors detected while checking ${routes.length} routes`).toEqual([]);
});
