# Production Client Error Diagnosis

Diagnosis date: 2026-07-18 (Asia/Shanghai)
Production URL: `https://palevioletred-termite-678917.hostingersite.com/`
Local reproduction runtime: Node.js `22.23.1`, Next.js `15.5.20`, system Chrome through Playwright

## 1. Git baseline

- Baseline known-good product-image commit: `99da8ea feat: add product images and replace placeholders`.
- Later commits before diagnosis:
  - `d9dcb29 fix: stabilize product image rendering on Hostinger`
  - `3eb34d8 feat: add product specification data workflow`
- The specification workflow was introduced by `3eb34d8`.
- Initial diagnosis started from a clean `main` worktree at `3eb34d8f1c9c080820820c9e5b2106882a9cba92`.

## 2. Production reproduction

The failure was reproduced with both the in-app browser and a standalone Playwright run using real Chrome.

Visible browser error:

> Application error: a client-side exception has occurred while loading palevioletred-termite-678917.hostingersite.com (see the browser console for more information).

Playwright checked 45 routes: the home page, product center, 26 published product pages, request-a-quote, about, the service center and six service pages, plus the application center and seven application pages.

### Captured browser errors

Initial home-page load:

- `404` for `/_next/static/css/e108ce57c2cb7ab7.css`
- `Failed to load resource: the server responded with a status of 404 ()`
- `net::ERR_ABORTED` for the same stylesheet
- `404` for `/_next/static/chunks/app/page-f161f91bfc5e2773.js`
- `Failed to load resource: the server responded with a status of 404 ()`
- `net::ERR_ABORTED` for the same page chunk

Initial request-a-quote load also returned `404` for `/_next/static/css/1e56156dad859381.css`.

A later direct inspection of the cached home HTML found another old asset set, also missing from the deployed static directory:

- `/_next/static/chunks/239-0efcf3b33fe933aa.js` — `404`
- `/_next/static/chunks/app/page-42a34e234d1c3916.js` — `404`
- `/_next/static/css/686293e93f0d77fd.css` — `404`

The home HTML itself returned `200`, so checking status code alone would not detect the outage.

### Stack trace status

No React component stack was emitted for the primary failure because the referenced page JavaScript bundle returned `404` and never executed. The actionable browser trace terminates at the failed static asset requests listed above. The Next.js client fallback was rendered before any product specification component could run.

## 3. Root cause

The production HTML and deployed `_next/static` files belonged to different builds.

Evidence from the production home response before the fix:

- `Cache-Control: s-maxage=31536000`
- `x-hcdn-cache-status: HIT`
- `Age: 16814` seconds during inspection
- `x-nextjs-cache: HIT`
- The cached HTML referenced page chunks and CSS files that returned `404`.
- A current shared layout chunk returned `200` with a much newer `Last-Modified` value, proving the static directory had already been replaced by a newer build.

Next.js statically generated pages were emitted with a one-year shared-cache lifetime. Hostinger hCDN retained old HTML across a deployment, while the deployment replaced the old hashed chunks. Browsers then received valid old HTML that referenced files no longer present.

This was not caused by `TechnicalSpecificationTable`, CSV values, `TBD`, `N/A`, JSON-LD serialization or an invalid Server/Client Component import. The specification table is a Server Component; filesystem-backed CSV readers remain on the server, and only strings are passed to the client RFQ form.

### Why local build passed

Local production HTML and `_next/static` files came from the same build, so every referenced chunk existed. Hostinger combined cached HTML from an earlier build with static assets from a newer deployment, creating a failure that compilation and server-side HTML checks cannot reproduce by themselves.

## 4. Minimal fix

Modified files:

- `app/layout.tsx`
  - Added `export const revalidate = 60` at the root layout.
  - Pages remain statically generated with ISR; they were not converted to full client rendering or fully dynamic rendering.
- `next.config.ts`
  - Added `expireTime: 60` so generated HTML uses `s-maxage=60` without a long stale-while-revalidate window.
- `app/icon.svg`
  - Added a local favicon to remove the final browser `console.error` caused by `/favicon.ico` returning `404`.
- `tests/production-client-errors.spec.ts`
  - Added a real-browser regression covering console errors, page errors, failed requests, HTTP errors, chunk failures and the Next.js application-error fallback across 45 routes.
- `tests/specifications.test.tsx`
  - Added missing-field, `N/A` and serializable client-prop regression coverage.
- `package.json` and `package-lock.json`
  - Added the minimal `@playwright/test` development dependency and `test:production-client` command.

No product specification data was deleted or weakened. React strict mode remains enabled. No error was hidden with an empty catch, hydration suppression or an error boundary.

## 5. Regression results

After the fix, the Node.js 22 production build reports `Revalidate 1m / Expire 1m` for statically generated pages. The local home response changed from `Cache-Control: s-maxage=31536000` to `Cache-Control: s-maxage=60`.

Playwright production-mode result against `http://127.0.0.1:3109`:

- Routes checked: 45
- Home page: passed
- Product center: passed
- Published product pages: 26/26 passed
- Service center and service pages: 7/7 passed
- Application center and application pages: 8/8 passed
- `pageerror`: 0
- `console.error`: 0
- JavaScript or CSS 404: 0
- Failed requests: 0
- Hydration errors: 0
- Next.js application-error fallback: 0

Specification regression coverage confirms:

- `TBD` values do not crash or appear in incomplete tables.
- `N/A` and missing fields safely degrade.
- Unverified and incomplete specifications do not generate invalid Product Schema properties.
- Client RFQ props are plain serializable strings.

## 6. Validation results

All commands ran with Node.js `22.23.1`.

- `npm run lint` — passed
- `npm run typecheck` — passed
- `npm run specs:validate` — passed for 26 rows with 3 existing warnings
- `npm run specs:report` — passed
- `npm run validate:products` — passed for 27 records
- `npm run check:links` — passed
- `npm run check:seo` — passed
- `npm run test` — 6 files and 29 tests passed
- `npm run build` — passed; 81 routes generated including `icon.svg`
- `npm run verify` — passed, including brand, contact-leak and duplicate-product checks
- Playwright production-client regression — passed

The three specification warnings are unchanged and relate to confirmed coating values without confirmed finished diameters for `GS-WRA-001`, `GS-LAN-002` and `GS-LAN-003`.

## 7. Hostinger redeployment procedure

After the fix is committed and pushed with user approval:

1. Confirm Hostinger uses Node.js 22.x and deploys the new commit.
2. Purge the Hostinger hCDN/site cache immediately after the deployment. This is required once because existing cached HTML still carries the old one-year cache header.
3. Confirm `NEXT_PUBLIC_SITE_URL` uses the intended public URL.
4. Open the site in a fresh browser context and verify the home page plus product, service, application and RFQ routes.
5. Confirm HTML responses return `Cache-Control: s-maxage=60`.
6. Confirm every `/_next/static/chunks` and `/_next/static/css` URL referenced by the returned HTML responds `200`.
7. Run `PRODUCTION_TEST_BASE_URL=https://palevioletred-termite-678917.hostingersite.com npm run test:production-client`.

Hostinger dashboard build/runtime logs were not available in the local workspace. Production response headers and browser network evidence were sufficient to identify the cache/build mismatch.

## 8. Deployment readiness

The code is ready for a controlled redeployment after review. Do not consider the production incident resolved until the new build is deployed, the existing Hostinger CDN cache is purged, and the production Playwright regression passes against the public URL.
