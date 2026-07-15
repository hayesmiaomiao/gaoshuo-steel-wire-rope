# Staging Acceptance Checklist

Use this checklist after deploying the project to a Hostinger temporary domain. Keep `STAGING_NOINDEX=true` until every launch-critical item is approved.

## 1. Environment

- `NEXT_PUBLIC_SITE_URL` is set to the staging HTTPS URL.
- `STAGING_NOINDEX=true`.
- Node.js version is `22.x`.
- Install command is `npm ci`.
- Build command is `npm run build`.
- Start command is `npm run start`.
- No real secrets are stored in GitHub files.
- Real secrets, if any, are only stored in Hostinger environment variables.

## 2. Crawl Protection

- `/robots.txt` returns `Disallow: /`.
- Normal pages include noindex and nofollow metadata.
- `/thank-you` remains noindex.
- `/sitemap.xml` is available for manual testing.
- Canonical URLs use the staging domain while on staging.
- No draft products are present in `/sitemap.xml`.

## 3. Core Page Checks

Check each page on desktop and mobile:

- `/`
- `/products`
- `/applications`
- `/capabilities`
- `/manufacturing`
- `/quality-control`
- `/about`
- `/resources`
- `/contact`
- `/request-a-quote`
- `/privacy-policy`
- `/thank-you`

For each page:

- HTTP status is 200.
- The page has one clear H1.
- Title and description are relevant.
- Header navigation works.
- Footer links work.
- CTA buttons work.
- No horizontal scrolling on mobile.
- Images are visible or intentionally marked placeholders.
- No console errors are visible during manual testing.

## 4. Product Category Checks

Check all category pages:

- `/products/wire-rope-assemblies`
- `/products/tool-safety-lanyards`
- `/products/suspension-hanging-kits`
- `/products/control-brake-cables`
- `/products/gym-fitness-cables`
- `/products/wire-rope-fittings`

For each category:

- Product cards load.
- Draft products are not displayed.
- Placeholder images are clearly placeholders.
- Category CTA opens the RFQ flow.
- Breadcrumb links work.

## 5. Product Detail Checks

Open at least 10 published product pages from `/products`.

For each product page:

- Product name and SKU are visible.
- Empty specification fields are not rendered as blank table rows.
- Applications and customization notes are accurate to the product data.
- Related products are relevant.
- RFQ form captures product context.
- Product schema does not include fake price, stock, reviews, ratings, or offers.

## 6. Service Page Checks

Check all published service pages:

- `/capabilities/custom-wire-rope-assemblies`
- `/capabilities/cutting`
- `/capabilities/swaging`
- `/capabilities/terminal-installation`
- `/capabilities/custom-packaging`
- `/capabilities/oem-private-label`

For each service:

- No unverified equipment, capacity, certification, or lead-time claims appear.
- RFQ CTA is visible.
- Source-site brand and contact details are absent.

## 7. Application Page Checks

Check all application pages:

- `/applications/marine`
- `/applications/crane-and-lifting`
- `/applications/architectural`
- `/applications/security-cables`
- `/applications/control-cables`
- `/applications/fitness-equipment`
- `/applications/industrial-assemblies`

For each application:

- Content is focused on B2B selection and RFQ.
- No unsupported safety-critical claims appear.
- Related products are relevant.

## 8. RFQ Checks

Test `/request-a-quote` and at least one product-page RFQ form:

- Required field validation works.
- Business email validation works.
- Privacy consent is required.
- Honeypot field is not visible to normal users.
- Allowed uploads: PDF, JPG, JPEG, PNG.
- Oversized upload is rejected with a clear message.
- UTM fields are captured from the URL.
- Referrer and landing page are captured.
- Production without a configured provider does not show fake success.
- Successful development-mode submissions redirect to `/thank-you` only where appropriate.

## 9. Brand and Content Checks

- Only `Gaoshuo Steel Wire Rope` appears as the public brand.
- No source-site domains appear in production pages.
- No source-site emails, phone numbers, WhatsApp numbers, addresses, maps, social links, QR codes, or copyright lines appear.
- Contact areas show neutral confirmed/empty states instead of fake contact details.
- No fake ISO, CE, API, customer, capacity, MOQ, lead-time, breaking-load, or test-report claims appear.

## 10. Final Approval Before Production

Only after this checklist passes:

- connect the final domain
- set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain
- set `STAGING_NOINDEX=false`
- redeploy
- rerun crawl and sitemap checks on the final domain
