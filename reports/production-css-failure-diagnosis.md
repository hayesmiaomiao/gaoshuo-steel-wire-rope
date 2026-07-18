# Hostinger production CSS failure diagnosis

Date: 2026-07-18

Production URL: `https://palevioletred-termite-678917.hostingersite.com/`

Inspected commit: `14a1e3f85c1d6b5f90c09877461047fb85679fc6`

## Executive conclusion

The production styling failure is caused by stale HTML retained by the Hostinger hCDN edge cache, not by a missing Tailwind import, a PostCSS failure, a filename case problem, or an invalid current build.

The cached HTML references CSS and JavaScript assets from an older deployment. Those hashed files are no longer present, so the browser receives HTTP 404 responses for the stylesheet and route chunks. The result is an unstyled document and, on product pages, a `ChunkLoadError`.

The current origin build is healthy. A cache-bypassed request returns fresh HTML with a valid stylesheet, and a clean Node.js 22 production build passes the browser style regression locally.

## Production evidence

### Normal public request (broken hCDN cache entry)

- `/` returned HTTP 200.
- `Cache-Control`: `s-maxage=31536000`.
- `x-hcdn-cache-status`: `HIT`.
- `Age`: `18745` seconds at inspection time.
- HTML referenced `/_next/static/css/686293e93f0d77fd.css` in the raw response check.
- That stylesheet returned HTTP 404 with `Content-Type: text/plain; charset=utf-8`.

A real Chrome run reproduced equivalent stale-build failures. Because different Hostinger edge responses may contain different old hashes, the browser also observed `/_next/static/css/e108ce57c2cb7ab7.css` returning 404. The hash difference does not change the diagnosis: both HTML responses reference deleted deployment assets.

Observed homepage computed styles while the CSS was missing:

- Body font: `Times New Roman`.
- Body margin: `8px`.
- Header position: `static` instead of `sticky`.
- Desktop navigation display: `block` instead of `flex`.
- Hero CTA background: transparent instead of `rgb(232, 130, 12)`.
- Featured Products container: `block` instead of `grid`.
- Footer background: transparent instead of `rgb(23, 23, 23)`.

The browser also recorded old JavaScript chunk 404 responses. A product detail route raised:

```text
ChunkLoadError: Loading chunk 221 failed.
```

The failed URL was an old `/_next/static/chunks/app/products/%5Bslug%5D/page-*.js` asset.

### Cache-bypassed request (healthy current origin)

A unique query-string request with no-cache headers returned:

- HTTP 200.
- `Cache-Control`: `s-maxage=60`.
- `x-hcdn-cache-status`: `DYNAMIC`.
- Fresh stylesheet: `/_next/static/css/13c83ebcafeac44f.css`.
- Stylesheet response: HTTP 200.
- Stylesheet MIME type: `text/css; charset=UTF-8`.
- Stylesheet size: 15,680 bytes.

This demonstrates that the currently deployed origin can serve complete HTML and CSS. The public root URL remains broken only because the old hCDN HTML entry is still being reused.

A final ordinary-URL recheck still returned the same old stylesheet with HTTP 404, `x-hcdn-cache-status: HIT`, `s-maxage=31536000`, and an increased `Age` value of 19,856 seconds. The production incident therefore remains active until the Hostinger edge entry is purged.

## Root cause location

There is no defective application stylesheet file or source-code line to patch for this incident. The failing object is an external Hostinger hCDN HTML cache entry. It contains asset hashes from an earlier build while the deployment now exposes a different asset set.

The current source safeguards are `app/layout.tsx` line 12 (`revalidate = 60`) and `next.config.ts` line 6 (`expireTime: 60`). They correctly affect fresh origin responses but cannot retroactively shorten an already-stored hCDN response carrying a one-year shared-cache lifetime. This is why `next build` succeeds and cache-bypassed requests are styled while the ordinary public URL remains unstyled.

## Source and build audit

- The active App Router root is `app/`.
- `app/layout.tsx` imports `./globals.css` at the top level.
- `app/globals.css` contains `@import "tailwindcss";` and the project theme/styles.
- `postcss.config.mjs` uses `@tailwindcss/postcss`.
- Installed Tailwind packages are version `4.3.2`.
- `next.config.ts` has no `assetPrefix`, `basePath`, output rewrite, or static asset rewrite.
- No service worker, `next-pwa`, or Workbox integration was found.
- No conflicting duplicate filename differing only by letter case was found.
- The global stylesheet import matches the file's exact case.

The existing cache-safety settings are also present in the current source:

- `app/layout.tsx`: `export const revalidate = 60;`
- `next.config.ts`: `expireTime: 60`

These values are reflected by the healthy origin response (`s-maxage=60`). The long-lived `s-maxage=31536000` header belongs to the stale cached response and is not produced by the current build.

## Clean Node.js 22 verification

The `.next` directory was removed after its resolved path was verified to be inside this project. Dependencies were restored with `npm ci` under Node.js `v22.23.1`, followed by a clean production build.

Build output contained one production CSS file:

- `.next/static/css/9996ee50e76e71cb.css`
- Size: 15,703 bytes.
- Non-empty and contains the body rules, Tailwind grid utilities, project orange `#e8820c`, and dark background utilities.

The local production server returned the CSS with HTTP 200 and `Content-Type: text/css; charset=UTF-8`.

## Regression protection added

`tests/production-styles.spec.ts` checks 21 representative routes:

- Homepage.
- Products index.
- All six product category pages.
- Ten published product detail pages.
- Custom wire rope assembly service page.
- About page.
- Request a Quote page.

For every route it requires navigation success, at least one stylesheet, HTTP 200 CSS responses, `text/css` MIME types, non-empty CSS bodies, and no HTML returned from CSS URLs. It also fails on console errors, page errors, and failed browser requests. The homepage additionally asserts the expected font reset, zero body margin, sticky header, desktop flex navigation, orange CTA, product grid, and dark footer.

The script is available as `npm run test:production-styles` and accepts `PRODUCTION_TEST_BASE_URL` for post-deployment checks.

Repository changes made during this task:

- `tests/production-styles.spec.ts`: adds the production CSS/browser regression.
- `package.json`: adds the `test:production-styles` command.
- `reports/production-css-failure-diagnosis.md`: records evidence, root cause, verification, and recovery steps.

## Required Hostinger recovery procedure

1. Redeploy the latest `main` branch using Node.js 22 and the existing production build/start commands.
2. Immediately clear the website cache in hPanel. If available, use **Websites → Dashboard → Clear/Flush cache**.
3. If Hostinger CDN controls are available, use **Websites → Dashboard → Performance → CDN → Flush cache**.
4. The temporary-domain optimization controls may not be exposed in hPanel. If neither cache control is available, contact Hostinger support and request an edge-cache purge for `palevioletred-termite-678917.hostingersite.com`, providing the stale `s-maxage=31536000`, `x-hcdn-cache-status: HIT`, and old hashed asset 404 evidence from this report.
5. Use Hostinger's no-cache preview, when available, to confirm the origin before testing the ordinary public URL.
6. Run both browser suites against the ordinary production URL:

```powershell
$env:PRODUCTION_TEST_BASE_URL='https://palevioletred-termite-678917.hostingersite.com'; npm run test:production-styles
$env:PRODUCTION_TEST_BASE_URL='https://palevioletred-termite-678917.hostingersite.com'; npm run test:production-client
```

7. Do not consider the incident resolved until the public URL returns the current CSS with HTTP 200, the expected CSS MIME type, and both browser suites pass without chunk errors.

Hostinger references:

- [How to clear cache in Hostinger](https://www.hostinger.com/support/1583501-how-to-clear-cache-in-hostinger/)
- [How to redeploy a Node.js application](https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/)
- [Hostinger CDN website optimization](https://www.hostinger.com/support/7935917-hostinger-cdn-website-optimization/)

## Scope control

No product content, technical specification, product mapping, visual design, or frontend inline style was changed. The only repository changes for this diagnosis are the browser regression test, its npm command, and this report.
